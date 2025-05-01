#!usr/bin/env bash
o=$(stty -g)
stty cbreak
node dist/cron_server.js & 
cron_server_pid=$!
yarn wrangler dev --test-scheduled
stty "$o"
kill $cron_server_pid
wait