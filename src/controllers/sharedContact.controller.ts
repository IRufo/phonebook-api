import { Request, Response } from "express";
import pool from "../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

export const shareContact = async (req: Request, res: Response): Promise<void> => {
    const { contact_id, shared_with_user_id, owner_id } = req.body;
    try {
        const [result] = await pool.query<ResultSetHeader>(
            "INSERT INTO shared_contacts (contact_id, shared_with_user_id, owner_id) VALUES (?, ?, ?)",
            [contact_id, shared_with_user_id, owner_id]
        );
        res.json({ success: true, message: "Contact shared", shareId: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database error", error });
    }
};

export const getSharedContacts = async (req: Request, res: Response): Promise<void> => {
    try {
        const [sharedContacts] = await pool.query<RowDataPacket[]>("SELECT * FROM shared_contacts");
        res.json({ success: true, sharedContacts });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database error", error });
    }
};

export const unshareContact = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        await pool.query<ResultSetHeader>(
            "UPDATE users SET shared_contacts = ? WHERE id = ?", ["Deleted", id]);
        res.json({ success: true, message: "Contact unshared" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database error", error });
    }
};