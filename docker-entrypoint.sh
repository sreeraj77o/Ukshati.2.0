#!/bin/bash
set -eo pipefail

# Check if the database is already initialized
if [ ! -d "/var/lib/mysql/$MYSQL_DATABASE" ]; then
  echo "Initializing database..."
else
  echo "Database already initialized, skipping initialization."
fi

# Run the original MySQL entrypoint
exec /entrypoint.sh "$@"