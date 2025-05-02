import { JsonResponse } from '../response.js';
import { Command } from './command.js';
import { getOptions, getUser } from './utility.js';
import * as DAPI from 'discord-api-types/v10';
import Groq from 'groq-sdk';
import { InteractionResponseType } from 'discord-interactions';

const systemPrompt = `You are to serve the role of an feature within a reminders application.
                      Your purpose is to provide the user of the application with an activity or task to do.
                      The task should not take too long, taking up an hour AT MAXIMUM.
                      Provide only the name of the task. For example: Touching grass.
                      Make sure to keep the response concise, and be sure the activity is something most people can do.
                      Try to include variety in your responses, but still cater to the user's interests.`;

async function getBoredActivity(apiKey: string, introText?: string) {
    let groq = new Groq({ apiKey });

    const prompt =
        systemPrompt +
        (introText ?
            `\n\nUser has written a brief introduction about themselves: ${introText}`
        :   '');

    const chatCompletion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
            {
                role: 'system',
                content: prompt,
            },
        ],
    });
    const result = chatCompletion.choices[0].message.content || '';
    return result;
}

export const bored: Command = {
    data: {
        name: 'bored',
        description: 'Get a random activity to do from AI!',
    },
    execute: async (interaction, env, ctx) => {
        ctx.waitUntil(
            (async () => {
                const interestResult: D1Result<UserDataRow> =
                    await env.DB.prepare(
                        'SELECT self_intro FROM user_data WHERE id = ?',
                    )
                        .bind(getUser(interaction))
                        .run();

                const interest =
                    interestResult.results.length > 0 ?
                        interestResult.results[0]?.self_intro
                    :   undefined;

                const suggestion = await getBoredActivity(
                    env.GROQ_API_KEY,
                    interest,
                );
                const result = await fetch(
                    `https://discord.com/api/v10/webhooks/${env.DISCORD_APPLICATION_ID}/${interaction.token}/messages/@original`,
                    {
                        method: 'PATCH',
                        body: JSON.stringify({
                            content: `
AI suggests: ${suggestion}
-# AI repeatedly providing activites you dislike? Use the /set-intro command to write a short introduction of yourself so the AI can know you better!`,
                        }),
                        headers: {
                            Authorization: `Bot ${env.DISCORD_TOKEN}`,
                            'Content-Type': 'application/json',
                        },
                    },
                );
                if (result.status !== 200) {
                    console.error(
                        'error: ' + result.status + ' ' + result.statusText,
                    );
                }
            })(),
        );

        return {
            type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE as any,
        };
    },
};

export const getIntro: Command = {
    data: {
        name: 'get-intro',
        description: 'Get your introduction about yourself.',
    },
    execute: async (interaction, env, ctx) => {
        const introResult: D1Result<UserDataRow> = await env.DB.prepare(
            'SELECT self_intro FROM user_data WHERE id = ?',
        )
            .bind(getUser(interaction))
            .run();

        const intro =
            introResult.results.length > 0 ?
                introResult.results[0]?.self_intro
            :   undefined;

        return {
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE as any,
            data: {
                content:
                    intro ?
                        `Your introduction is: ${intro}`
                    :   `You do not have an introduction set.`,
            },
        };
    },
};

export const setIntro: Command = {
    data: {
        name: 'set-intro',
        description:
            'Set a short introduction about yourself for the AI to know you better.',
    },
    execute: async (interaction, env, ctx) => {
        const introResult: D1Result<UserDataRow> = await env.DB.prepare(
            'SELECT self_intro FROM user_data WHERE id = ?',
        )
            .bind(getUser(interaction))
            .run();

        const intro = introResult.results[0]?.self_intro;
        return {
            type: InteractionResponseType.MODAL as any,
            data: {
                custom_id: 'set-intro',
                title: 'Set your introduction',
                components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 4,
                                custom_id: 'intro',
                                label: 'Your introduction (set blank to remove)',
                                style: 1,
                                placeholder:
                                    'Tell the AI about yourself! Set blank to remove.',
                                value: intro,
                                min_length: 0,
                                max_length: 1024,
                                required: false,
                            },
                        ],
                    },
                ],
            },
        };
    },
    formSubmitHandler: async (interaction, env, ctx) => {
        console.log(interaction);
        const components = interaction.data.components[0].components;
        const introComponent = components[0];
        const intro = introComponent.value as string;
        const userId = getUser(interaction as unknown as DAPI.APIInteraction);

        if (!intro) {
            await env.DB.prepare('DELETE FROM user_data WHERE id = ?')
                .bind(userId)
                .run();
            return {
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE as any,
                data: {
                    content: `Succesfully removed introduction.`,
                },
            };
        }

        await env.DB.prepare(
            'INSERT OR REPLACE INTO user_data (id, self_intro) VALUES (?, ?)',
        )
            .bind(userId, intro)
            .run();

        return {
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE as any,
            data: {
                content: `Succesfully set introduction to "${intro}".`,
            },
        };
    },
};
