import commands from './commands/commands.js';
import dotenv from 'dotenv';
import process from 'node:process';
/**
 * This file is meant to be run from the command line, and is not used by the
 * application server.  It's allowed to use node.js primitives, and only needs
 * to be run once.
 */
dotenv.config();

const prod = process.env.PROD;

const token =
    prod ? process.env.PROD_DISCORD_TOKEN : process.env.DEV_DISCORD_TOKEN;
const applicationId =
    prod ?
        process.env.PROD_DISCORD_APPLICATION_ID
    :   process.env.DEV_DISCORD_APPLICATION_ID;

if (!token || !applicationId) {
    console.error(`Missing environment variables. Ensure the following are set:
        When PROD is set:
            PROD_DISCORD_TOKEN
            PROD_DISCORD_APPLICATION_ID
        When PROD is not set:
            DEV_DISCORD_TOKEN
            DEV_DISCORD_APPLICATION_ID`);
    process.exit(1);
}

if (prod) {
    console.log(
        'registering prod commands, unset PROD to register dev commands',
    );
} else {
    console.log('registering dev commands, set PROD to register prod commands');
}

const commandList = Object.values(commands).map((val, ind, arr) => val.data);

const url = `https://discord.com/api/v10/applications/${applicationId}/commands`;
const response = await fetch(url, {
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${token}`,
    },
    method: 'PUT',
    body: JSON.stringify(commandList),
});
if (response.ok) {
    console.log('Registered all commands');
} else {
    console.error('Error registering commands');
    let errorText = `Error registering commands \n ${response.url}: ${response.status} ${response.statusText}`;
    try {
        const error = await response.text();
        if (error) {
            errorText = `${errorText} \n\n ${error}`;
        }
    } catch (err) {
        console.error('Error reading body from request:', err);
    }
    console.error(errorText);
}

console.log(commandList);
