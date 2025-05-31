#!/bin/bash

# Define backup directory (mapped to host via docker-compose)
BACKUP_DIR=/backups
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql"

# Create backup directory if it doesn’t exist
mkdir -p ${BACKUP_DIR}

# Dump the database to a timestamped file
mysqldump -ucompany -p$MYSQL_PASSWORD company_db > ${BACKUP_FILE}

# Set permissions so the file is readable
chmod 644 ${BACKUP_FILE}

# Log the backup
echo "$(date): Database backup saved to ${BACKUP_FILE}" >> /var/log/backup.log