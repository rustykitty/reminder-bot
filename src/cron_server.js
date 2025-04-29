// This is meant for dev use ONLY.

import { exec } from "child_process";

import cron from "node-cron";

const cron_schedule = "* * * * *";

const cron_url = `http://localhost:8787/__scheduled?cron=${encodeURIComponent(cron_schedule)}`;

cron.schedule(cron_schedule, async () => {
    const result = await fetch(cron_url);
    if (!result.ok) {
        console.error(result.status + " " + result.statusText);
    } 
});

console.log("Cron server start");