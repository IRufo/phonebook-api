import { Request, Response } from "express";
import pool from "../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import bcrypt from "bcryptjs";

export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const [users] = await pool.query<RowDataPacket[]>("SELECT * FROM users");
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database error", error });
    }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const [user] = await pool.query<RowDataPacket[]>("SELECT * FROM users WHERE id = ?", [id]);
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database error", error });
    }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { first_name, last_name, email } = req.body;

    const updates: any = {};
    if (first_name) updates.first_name = first_name;
    if (last_name) updates.last_name = last_name;
    if (email) updates.email = email;

    if (Object.keys(updates).length === 0) {
        res.status(400).json({ success: false, message: "No valid fields provided to update" });
        return;
    }

    try {
        const setClause = Object.keys(updates).map((key) => `${key} = ?`).join(", ");
        const values = Object.values(updates);

        await pool.query(
            `UPDATE users SET ${setClause} WHERE id = ?`,
            [...values, id]
        );

        res.json({ success: true, message: "User updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database error", error });
    }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        await pool.query<ResultSetHeader>(
            "UPDATE users SET status = ? WHERE id = ?",
            ["Deleted", id]);
        res.json({ success: true, message: "User deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database error", error });
    }
};

export const activateUser = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const [result] = await pool.query<ResultSetHeader>(
            "UPDATE users SET status = ? WHERE id = ? AND status = ?",
            ["Active", id, "Pending"]
        );

        if (result.affectedRows === 0) {
            res.status(404).json({ success: false, message: "User not found or already active" });
            return;
        }

        res.json({ success: true, message: "User activated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database error", error });
    }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { first_name, last_name, email, password } = req.body || {};

        if (!first_name || !last_name || !email || !password) {
            res.status(400).json({ success: false, message: "All fields are required" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.query<ResultSetHeader>(
            "INSERT INTO users (first_name, last_name, email, password, status) VALUES (?, ?, ?, ?, ?)",
            [first_name, last_name, email, hashedPassword, 'Active']
        );

        res.status(201).json({ success: true, message: "Created user successfully", userId: result.insertId });
    } catch (err: any) {
        if (err.code === "ER_DUP_ENTRY") {
            res.status(409).json({ success: false, message: "Email already in use" });
            return;
        }

        res.status(500).json({ success: false, message: "Database error", error: err });
    }
};