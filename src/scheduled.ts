import * as DAPI from 'discord-api-types/v10';

export async function scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    const db: D1Database = env.DB;
    const now = Math.floor(+new Date() / 1000);
    const results: D1Result<DBRow>[] = await db.batch([
        db.prepare('SELECT * FROM reminders WHERE timestamp <= ? ORDER BY timestamp ASC').bind(now),
        db.prepare('DELETE FROM reminders WHERE timestamp <= ?').bind(now),
    ]);
    const reminders: DBRow[] = results[0].results;
    for (const reminder of reminders) {
        const { user_id, message, timestamp } = reminder;
        const dm_response = await fetch(`https://discord.com/api/v10/users/@me/channels`, {
            method: 'POST',
            body: JSON.stringify({ recipient_id: user_id }),
            headers: {
                Authorization: `Bot ${env.DISCORD_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });
        if (dm_response.status !== 200) {
            console.error(`Failed to open DM with user ${user_id}: ${dm_response} ${dm_response.statusText}`);
            console.error(dm_response.body);
            continue;
        }
        const channel_id = ((await dm_response.json()) as DAPI.APIChannel).id;
        await fetch(`https://discord.com/api/v10/channels/${channel_id}/messages`, {
            method: 'POST',
            body: JSON.stringify({
                content: `You asked me to remind you about "${message}" at <t:${timestamp}:F>.`,
            }),
            headers: {
                Authorization: `Bot ${env.DISCORD_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });
    }
}

export default {
    scheduled,
};
