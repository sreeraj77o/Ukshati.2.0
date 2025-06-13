import mysql from "mysql2/promise";
import dotenv from 'dotenv';

dotenv.config();

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,  // Ensures that queries wait for an available connection
  connectionLimit: 10,       // Adjust based on your concurrency needs
  queueLimit: 0,             // No limit on queued connections
  acquireTimeout: 60000,     // 60 seconds timeout for getting connection
  timeout: 60000,            // 60 seconds timeout for queries
  reconnect: true,           // Automatically reconnect
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