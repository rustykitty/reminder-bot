// This is meant for dev use ONLY.

import { exec } from 'child_process';

const cron_url = `http://localhost:8787/__scheduled?cron=${encodeURIComponent('* * * * *')}`;

setInterval(() => {
    const result = fetch(cron_url).then(
        (response) => {
            if (!result.ok) {
                console.error(result.status + ' ' + result.statusText);
            }
        },
        (error) => {
            console.error(error);
        },
    );
}, 60000);

console.log('Cron server start');
