import { JsonResponse } from '../response.js';
import { Command } from './command.js';
import { getOptions } from './options.js';
import * as DAPI from 'discord-api-types/v10';
import Groq from 'groq-sdk';
import { InteractionResponseType } from 'discord-interactions';

async function getBoredActivity(apiKey: string) {
    let groq = new Groq({ apiKey });

    const chatCompletion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
            {
                role: 'system',
                content: `You are a generative large language model integrated into a Reminders application. 
                          Your purpose is to provide the user with an activity or task to do when they are bored. 
                          Provide only the name of the task. For example: Going outside and touching grass.
                          Make sure to keep the response concise, and keep the task to something that anyone can do.`
            },
            {
                role: 'user',
                content: 'I am bored and would like something to do.',
            },
        ],
    });
    const result = chatCompletion.choices[0].message.content || "";
    return result;
}

export const bored: Command = {
    data: {
        name: 'bored',
        description: 'Get a random activity to do from AI!',
    },
    execute: async (interaction, env) => {
        const { prompt } = getOptions(interaction);
        const result = await getBoredActivity(env.GROQ_API_KEY);
        return new JsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: `AI says: ${result}`,
            },
        });
    },
};
