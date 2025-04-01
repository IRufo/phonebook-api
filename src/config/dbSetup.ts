import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Create a connection to MySQL (without selecting a database first)
const connectionConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true, // Allow multiple SQL queries
};

const databaseName = process.env.DB_NAME;

const setupDatabase = async () => {
    try {
        // Connect to MySQL without a specific database
        const connection = await mysql.createConnection(connectionConfig);

        // Create the database if it does not exist
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\`;`);
        console.log(`✅ Database '${databaseName}' is ready.`);

        // Now connect to the created database
        const pool = await mysql.createPool({ ...connectionConfig, database: databaseName });

        // Create tables
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('Admin', 'User', 'Super Admin') NOT NULL DEFAULT 'User',
                status ENUM('Pending', 'Active', 'Archived', 'Deleted') NOT NULL DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS contacts (
                id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
                owner_id CHAR(36) NOT NULL,
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                contact_number VARCHAR(20) NOT NULL,
                email VARCHAR(100),
                profile_photo_url VARCHAR(255),
                status ENUM('Draft', 'Active', 'Archived', 'Deleted') NOT NULL DEFAULT 'Draft',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
            );      

            CREATE TABLE IF NOT EXISTS shared_contacts (
                id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
                contact_id CHAR(36) NOT NULL,
                shared_with_user_id CHAR(36) NOT NULL,
                owner_id CHAR(36) NOT NULL,
                status ENUM('Draft', 'Active', 'Archived', 'Deleted') NOT NULL DEFAULT 'Draft',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
                FOREIGN KEY (shared_with_user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        console.log("✅ Tables are ready.");
        await connection.end(); // Close connection
    } catch (error) {
        console.error("❌ Error setting up the database:", error);
    }
};

// Run setup
setupDatabase();
