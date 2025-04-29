#!usr/bin/env bash
o=$(stty -g)
stty cbreak
node dist/cron_server.js & 
yarn wrangler dev --test-scheduled
stty "$o"