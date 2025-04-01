import { Request, Response } from "express";
import pool from "../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { first_name, last_name, email, password } = req.body || {};

        if (!first_name || !last_name || !email || !password) {
            res.status(400).json({ success: false, message: "All fields are required" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query<ResultSetHeader>(
            "INSERT INTO users (first_name, last_name, email, password, status) VALUES (?, ?, ?, ?, ?)",
            [first_name, last_name, email, hashedPassword, 'Pending']
        );

        res.status(201).json({ success: true, message: "Registration request sent! Status: Pending" });
    } catch (err: any) {
        if (err.code === "ER_DUP_ENTRY") {
            res.status(409).json({ success: false, message: "Email already in use" });
            return;
        }
        res.status(500).json({ success: false, message: "Database error", error: err });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(401).json({ success: false, message: "Email and password are required." });
            return;
        }

        const [users] = await pool.query<RowDataPacket[]>(
            "SELECT id, role, password, status FROM users WHERE email = ?", 
            [email]
        );

        if (users.length === 0) {
            res.status(401).json({ success: false, message: "Invalid credentials" });
            return;
        }

        const { id, role, password: hashedPassword, status } = users[0];

        const isMatch = await bcrypt.compare(password, hashedPassword);

        if (!isMatch) {
            res.status(401).json({ success: false, message: "Invalid credentials" });
            return;
        }

        if (status !== "Active") {
            res.status(403).json({ success: false, message: `Account is ${status}. Please contact an administrator.` });
            return;
        }

        const token = jwt.sign({ id, role }, JWT_SECRET, { expiresIn: "1h" });

        res.json({ success: true, token });
    } catch (err) {
        res.status(500).json({ success: false, message: "Database error", error: err });
    }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        const [users] = await pool.query<RowDataPacket[]>("SELECT * FROM users WHERE email = ?", [email]);

        if (users.length === 0) {
             res.status(404).json({ success: false, message: "User not found" });
             return;
        }

        const { id } = users[0];
        const resetToken = jwt.sign({ userId: id }, JWT_SECRET, { expiresIn: "15m" });

        res.json({ success: true, message: "Password reset token generated", resetToken });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database error", error });
    }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { authorization } = req.headers;
        const { newPassword } = req.body;

        if (!authorization || !newPassword) {
            res.status(400).json({ success: false, message: "Token and new password are required" });
            return;
        }

        const token = authorization.split(' ')[1];
        
        if (!token) {
            res.status(401).json({ success: false, message: "Authorization token is required" });
            return;
        }

        const decoded: any = jwt.verify(token, JWT_SECRET);
        const { userId } = decoded;

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await pool.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, userId]);

        res.json({ success: true, message: "Password reset successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Invalid or expired token", error });
    }
};