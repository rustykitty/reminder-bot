// This is meant for dev use ONLY.

import { exec } from 'child_process';

const cron_url = `http://localhost:8787/__scheduled?cron=${encodeURIComponent("* * * * *")}`;

setInterval(async () => {
    const result = await fetch(cron_url);
    if (!result.ok) {
        console.error(result.status + ' ' + result.statusText);
    }
}, 60000);

console.log('Cron server start');
