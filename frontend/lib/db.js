import mysql from "mysql2/promise";
import dotenv from 'dotenv';

dotenv.config();

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'company',
  password: process.env.DB_PASSWORD || 'Ukshati@123',
  database: process.env.DB_NAME || 'company_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,  
  connectionLimit: 10,       
  queueLimit: 0,             

  charset: 'utf8mb4',
  ssl: false,                
  authPlugins: {
    mysql_native_password: () => () => Buffer.alloc(0)
  }
});

// Function to get a connection from the pool
export async function connectToDB() {
  const connection = await pool.getConnection();
  return connection;
}

// Function to get a connection from the pool (alias for API compatibility)
export async function getConnection() {
  const connection = await pool.getConnection();
  return connection;
}

// Default export for backward compatibility
export default pool;