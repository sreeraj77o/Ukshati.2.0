-- Initialize authentication for backup system compatibility
-- This script ensures the database user uses mysql_native_password for MariaDB client compatibility

-- Create the company user if it doesn't exist and set proper authentication
CREATE USER IF NOT EXISTS 'company'@'%' IDENTIFIED WITH mysql_native_password BY 'Ukshati@123';

-- Grant necessary privileges
GRANT ALL PRIVILEGES ON company_db.* TO 'company'@'%';
GRANT SELECT, PROCESS, SHOW DATABASES, LOCK TABLES ON *.* TO 'company'@'%';

-- Ensure the user can perform backup operations
GRANT RELOAD, LOCK TABLES, REPLICATION CLIENT ON *.* TO 'company'@'%';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;

-- Verify the user authentication method
SELECT user, host, plugin FROM mysql.user WHERE user = 'company';
