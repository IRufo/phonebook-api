import mysql, { Pool, PoolConnection } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool: Pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true, // ✅ Ensure queued connections
  connectionLimit: 10, // ✅ Max concurrent connections
  queueLimit: 0, // ✅ Unlimited queue
  multipleStatements: true, // ✅ Allow multiple SQL statements
});

export const getConnection = async (): Promise<PoolConnection> => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL Database Connected');
    return connection;
  } catch (error) {
    console.error('❌ MySQL Connection Failed:', error);
    throw error;
  }
};

export default pool;
