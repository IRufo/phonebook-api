import pool from "./db";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

// Default Admin & Super Admin Credentials
const DEFAULT_USERS = [
    {
        first_name: "Super",
        last_name: "Admin",
        email: "superadmin@kmc.com", // should encrypt this
        password: "N5EykyBPQm4qgrJ",
        role: "Super Admin",
        status: "Active"
    },
    {
        first_name: "Admin",
        last_name: "User",
        email: "admin@kmc.com",
        password: "G94SLZbAsW06mok", // should encrypt this
        role: "Admin",
        status: "Active"
    }
];

const initializeAdmin = async () => {
    try {
        console.log("🔄 Checking for Admin and Super Admin accounts...");

        for (const user of DEFAULT_USERS) {
            const { email, first_name, last_name, password, role, status } = user;

            const [existingUser]: any = await pool.query(
                "SELECT id FROM users WHERE email = ?",
                [email]
            );

            if (existingUser.length === 0) {
                console.log(`✅ Creating ${role} account: ${email}`);

                const hashedPassword = await bcrypt.hash(password, 10);

                await pool.query(
                    "INSERT INTO users (first_name, last_name, email, password, role, status) VALUES (?, ?, ?, ?, ?, ?)",
                    [first_name, last_name, email, hashedPassword, role, status]
                );
            } else {
                console.log(`✔ ${role} account already exists: ${email}`);
            }
        }

        console.log("🚀 Admin accounts initialized successfully.");
    } catch (error) {
        console.error("❌ Error initializing admin accounts:", error);
    }
};

export default initializeAdmin;
