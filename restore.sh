#!/bin/bash
LATEST_BACKUP=$(ls -t /backups/backup_*.sql | head -n 1)
mysql -ucompany -p$MYSQL_PASSWORD company_db < $LATEST_BACKUP
echo "$(date): Database restored from ${LATEST_BACKUP}" >> /var/log/backup.log
find ${BACKUP_DIR} -type f -mtime +30 -name 'backup_*.sql' -delete