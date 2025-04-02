import { Request, Response } from "express";
import pool from "../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

export const shareContact = async (req: Request, res: Response): Promise<void> => {
    const { contact_id, shared_with_user_id, owner_id } = req.body;
    try {
        const [result] = await pool.query<ResultSetHeader>(
            "INSERT INTO shared_contacts (contact_id, shared_with_user_id, owner_id, status) VALUES (?, ?, ?, ?)",
            [contact_id, shared_with_user_id, owner_id, 'Active']
        );
        res.json({ success: true, message: "Contact shared", data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database error", data: null, error });
    }
};


export const getContactsSharedWithMe = async (req: any, res: Response): Promise<void> => {
    try {
        const query = `
            SELECT c.id, c.first_name, c.last_name, c.email, c.phone_number, c.created_at, c.updated_at
            FROM shared_contacts sc
            INNER JOIN contacts c ON sc.contact_id = c.id
            WHERE sc.shared_with_user_id = ? AND sc.status = 'Active'
        `;
        
        const [sharedContacts] = await pool.query<RowDataPacket[]>(query, [req.user.id]);
        res.json({ success: true, data: sharedContacts });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database error", data: null, error });
    }
};

export const getSharedContacts = async (req: any, res: Response): Promise<void> => {
    try {
        const query = `
            SELECT c.id, c.first_name, c.last_name, c.email, c.phone_number, c.created_at, c.updated_at, sc.owner_id
            FROM shared_contacts sc
            INNER JOIN contacts c ON sc.contact_id = c.id
            WHERE sc.owner_id = ? AND sc.status = 'Active'
        `;
        
        const [sharedContacts] = await pool.query<RowDataPacket[]>(query, [req.user.id]);
        res.json({ success: true, data: sharedContacts });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database error", data: null, error });
    }
};


export const getSharedContact = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const [sharedContact] = await pool.query<RowDataPacket[]>("SELECT * FROM shared_contacts WHERE id = ?", [id]);
        res.json({ success: true, data: sharedContact });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database error", data: null, error });
    }
};

export const unshareContact = async (req: any, res: Response): Promise<void> => {
    try {
        await pool.query<ResultSetHeader>(
            "UPDATE shared_contacts SET status = ? WHERE owner_id = ? AND contact_id = ?", ["Deleted", req.user.id, req.params.id]);
        res.json({ success: true, message: "Contact unshared", data: null });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database error", data: null, error });
    }
};
