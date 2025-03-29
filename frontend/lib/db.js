import mysql from "mysql2/promise";
import dotenv from 'dotenv';
// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,  // Ensures that queries wait for an available connection
  connectionLimit: 10,       // Adjust based on your concurrency needs
  queueLimit: 0,             // No limit on queued connections
});

// Function to get a connection from the pool
export async function connectToDB() {
  const connection = await pool.getConnection();
  return connection;
}

dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

export default db;