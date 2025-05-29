#!/bin/bash
set -eo pipefail

# Check if the database is already initialized
if [ ! -d "/var/lib/mysql/$MYSQL_DATABASE" ]; then
  echo "Initializing database..."
  # Start backup cron job
  echo "*/5 * * * * /backup.sh" | crontab -
  crond
else
  echo "Database already initialized, skipping initialization."
  # Still start the cron job for backups
  echo "*/5 * * * * /backup.sh" | crontab -
  crond
fi

# Run the original MySQL entrypoint
exec /entrypoint.sh "$@"