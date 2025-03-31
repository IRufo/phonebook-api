// controllers/user.controller.ts
import { Request, Response } from "express";
import pool from "../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Get all users
export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const [users] = await pool.query<RowDataPacket[]>("SELECT * FROM users");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Database error", error });
    }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const [user] = await pool.query<RowDataPacket[]>("SELECT * FROM users WHERE id = ?", [id]);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Database error", error });
    }
};

// Register user
export const registerUser = async (req: Request, res: Response): Promise<void> => {
    const { first_name, last_name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const [result] = await pool.query<ResultSetHeader>(
            "INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)",
            [first_name, last_name, email, hashedPassword, role]
        );
        res.status(201).json({ message: "User registered", userId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: "Database error", error });
    }
};

// Login user
export const loginUser = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    try {
        const [users] = await pool.query<RowDataPacket[]>(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            res.status(401).json({ message: "Invalid email or password" });
            return;
        }

        const user = users[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            res.status(401).json({ message: "Invalid email or password" });
            return;
        }

        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });

        res.json({ message: "Login successful", token, user: { id: user.id, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: "Database error", error });
    }
};

// Update user
export const updateUser = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { first_name, last_name, email } = req.body;
    try {
        await pool.query("UPDATE users SET first_name = ?, last_name = ?, email = ? WHERE id = ?", 
            [first_name, last_name, email, id]
        );
        res.json({ message: "User updated" });
    } catch (error) {
        res.status(500).json({ message: "Database error", error });
    }
};

// Delete user
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM users WHERE id = ?", [id]);
        res.json({ message: "User deleted" });
    } catch (error) {
        res.status(500).json({ message: "Database error", error });
    }
};
