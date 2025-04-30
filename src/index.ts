import { AutoRouter } from 'itty-router';
import { InteractionResponseFlags, InteractionResponseType, InteractionType, verifyKey } from 'discord-interactions';
import { JsonResponse } from './response.js';
import commands from './commands/commands.js';
import { scheduled } from './scheduled.js';

const router = AutoRouter();

async function verifyDiscordRequest(request: Request, env: Env): Promise<{ interaction?: any; isValid: boolean }> {
    const signature = request.headers.get('X-Signature-Ed25519');
    const timestamp = request.headers.get('X-Signature-Timestamp');
    const body: string = await request.text();
    const isValidRequest =
        signature && timestamp && (await verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY));
    if (!isValidRequest) {
        return { isValid: false };
    }

    return { interaction: JSON.parse(body), isValid: true };
}

router.get('/', (request: Request, env: Env) => {
    return new Response(`Bot is running on user ID ${env.DISCORD_APPLICATION_ID}`);
});

router.post('/', async (request: Request, env: Env): Promise<JsonResponse> => {
    const { isValid, interaction } = await verifyDiscordRequest(request, env);

    if (!isValid || !interaction) {
        return new Response('Bad request signature.', { status: 401 });
    }

    if (interaction.type === InteractionType.PING) {
        // The `PING` message is used during the initial webhook handshake, and is
        // required to configure the webhook in the developer portal.
        return new JsonResponse({
            type: InteractionResponseType.PONG,
        });
    } else if (interaction.type === InteractionType.APPLICATION_COMMAND) {
        // Most user commands will come as `APPLICATION_COMMAND`.
        const command = interaction.data.name.toLowerCase();
        if (commands[command]) {
            try {
                let response = await commands[command].execute(interaction, env);
                return new JsonResponse(response);
            } catch (e: any) {
                console.error(e);
                return new JsonResponse({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: 'An error occurred: \n' + (e.stack ?? e),
                    },
                });
            }
        } else {
            return new JsonResponse({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: `Unknown command ${interaction.data.name}`,
                },
            });
        }
    }

    return new JsonResponse({ error: 'Unknown Type' }, { status: 400 });
});

router.all('*', () => new Response('Not Found.', { status: 404 }));

const index = {
    verifyDiscordRequest,
    fetch: router.fetch,
    scheduled,
};

export default index;
