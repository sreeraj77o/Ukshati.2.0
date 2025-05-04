#!/bin/bash
set -eo pipefail

# Start backup cron job in background
echo "*/5 * * * * /backup.sh" | crontab -
crond

# Run original MySQL entrypoint
exec /entrypoint.sh "$@"