// controllers/contact.controller.ts
import { Request, Response, NextFunction } from "express";
import pool from "../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { authenticateUser } from "../middleware/authenticateuser.middleware";

interface AuthRequest extends Request {
    user?: { id: number; role: string };
}

// Get all contacts
export const getContacts = async (req: Request, res: Response): Promise<Response> => {
    try {
        const [contacts] = await pool.query<RowDataPacket[]>("SELECT * FROM contacts");
        return res.json(contacts);
    } catch (error) {
        return res.status(500).json({ message: "Database error", error });
    }
};

// Get contact by ID
export const getContactById = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    try {
        const [contact] = await pool.query<RowDataPacket[]>("SELECT * FROM contacts WHERE id = ?", [id]);
        if (!contact.length) return res.status(404).json({ message: "Contact not found" });
        return res.json(contact[0]);
    } catch (error) {
        return res.status(500).json({ message: "Database error", error });
    }
};

// Add new contact (Authenticated users only)
export const addContact = [
    authenticateUser,
    async (req: AuthRequest, res: Response): Promise<Response> => {
        const { first_name, last_name, contact_number, email, profile_photo } = req.body;
        const owner_id = req.user?.id;
        if (!owner_id || !first_name || !last_name || !contact_number || !email) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }
        try {
            const [result] = await pool.query<ResultSetHeader>(
                "INSERT INTO contacts (owner_id, first_name, last_name, contact_number, email, profile_photo) VALUES (?, ?, ?, ?, ?, ?)",
                [owner_id, first_name, last_name, contact_number, email, profile_photo]
            );
            return res.status(201).json({ message: "Contact added successfully", contactId: result.insertId });
        } catch (error) {
            return res.status(500).json({ message: "Database error", error });
        }
    }
];

// Update contact (Only owner can update)
export const updateContact = [
    authenticateUser,
    async (req: AuthRequest, res: Response): Promise<Response> => {
        const { id } = req.params;
        const { first_name, last_name, contact_number, email, profile_photo } = req.body;
        try {
            const [contact] = await pool.query<RowDataPacket[]>("SELECT owner_id FROM contacts WHERE id = ?", [id]);
            if (!contact.length || contact[0].owner_id !== req.user?.id) {
                return res.status(403).json({ message: "Forbidden: You are not the owner of this contact" });
            }
            await pool.query(
                "UPDATE contacts SET first_name = ?, last_name = ?, contact_number = ?, email = ?, profile_photo = ? WHERE id = ?",
                [first_name, last_name, contact_number, email, profile_photo, id]
            );
            return res.json({ message: "Contact updated" });
        } catch (error) {
            return res.status(500).json({ message: "Database error", error });
        }
    }
];

// Delete contact (Only owner can delete)
export const deleteContact = [
    authenticateUser,
    async (req: AuthRequest, res: Response): Promise<Response> => {
        const { id } = req.params;
        try {
            const [contact] = await pool.query<RowDataPacket[]>("SELECT owner_id FROM contacts WHERE id = ?", [id]);
            if (!contact.length || contact[0].owner_id !== req.user?.id) {
                return res.status(403).json({ message: "Forbidden: You are not the owner of this contact" });
            }
            await pool.query("DELETE FROM contacts WHERE id = ?", [id]);
            return res.json({ message: "Contact deleted" });
        } catch (error) {
            return res.status(500).json({ message: "Database error", error });
        }
    }
];
