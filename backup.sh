#!/bin/bash

# Dump current database state
mysqldump -ucompany -p$MYSQL_PASSWORD company_db > /docker-entrypoint-initdb.d/init.sql

# Preserve permissions
chmod 644 /docker-entrypoint-initdb.d/init.sql

echo "$(date): Database backup completed" >> /var/log/backup.log