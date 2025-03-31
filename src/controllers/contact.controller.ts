import { Request, Response } from "express";
import pool from "../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import multer from "multer";
import path from "path";

interface AuthRequest extends Request {
    user?: { id: number; role: string };
}

// Get all contacts
export const getContacts = async (req: Request, res: Response): Promise<void> => {
    try {
        const [contacts] = await pool.query<RowDataPacket[]>("SELECT * FROM contacts");
        res.json(contacts); // No return here, the function exits after sending the response
    } catch (error) {
        res.status(500).json({ message: "Database error", error });
    }
};

// Get contact by ID
export const getContactById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const [contact] = await pool.query<RowDataPacket[]>("SELECT * FROM contacts WHERE id = ?", [id]);
        if (!contact.length) {
            res.status(404).json({ message: "Contact not found" });
            return; // Ensure we exit after responding
        }
        res.json(contact[0]); // The function exits after this
    } catch (error) {
        res.status(500).json({ message: "Database error", error });
    }
};

// Add new contact (Authenticated users only)
export const addContact = async (req: AuthRequest, res: Response): Promise<void> => {
    const { first_name, last_name, contact_number, email } = req.body;
    console.log("sdfsdfsdf", req.body)
    const owner_id = req.user?.id;
    console.log('sdfdsf',  req.file)
    const profile_photo_url = req.file ? req.file.filename : null;

    if (!owner_id || !first_name || !last_name || !contact_number || !email) {
        res.status(400).json({ message: "All required fields must be provided" });
        return;
    }

    try {
        const [result] = await pool.query<ResultSetHeader>(
            "INSERT INTO contacts (owner_id, first_name, last_name, contact_number, email, profile_photo_url) VALUES (?, ?, ?, ?, ?, ?)",
            [owner_id, first_name, last_name, contact_number, email, profile_photo_url]
        );
        res.status(201).json({ message: "Contact added successfully", contactId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: "Database error", error });
    }
};

// Update contact (Only owner can update)
export const updateContact = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { first_name, last_name, contact_number, email } = req.body;
    console.log('sdfsdfdsf',  req.file )
    const profile_photo_url = req.file ? req.file.filename : null;

    // Dynamically build the update object with only provided fields
    const updates: any = {};
    if (first_name) updates.first_name = first_name;
    if (last_name) updates.last_name = last_name;
    if (contact_number) updates.contact_number = contact_number;
    if (email) updates.email = email;
    if (profile_photo_url) updates.profile_photo_url = profile_photo_url;

    // If no fields are provided to update
    if (Object.keys(updates).length === 0) {
        res.status(400).json({ message: "No valid fields provided to update" });
        return;
    }

    try {
        // Dynamically build the SET part of the query based on the provided fields
        const setClause = Object.keys(updates).map((key) => `${key} = ?`).join(", ");
        const values = Object.values(updates);

        // Execute the update query
        await pool.query(
            `UPDATE contacts SET ${setClause} WHERE id = ?`,
            [...values, id]
        );
        res.json({ message: "Contact updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Database error", error });
    }
};


// Delete contact (Only owner can delete)
export const deleteContact = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        await pool.query<ResultSetHeader>(
            "UPDATE users SET contacts = ? WHERE id = ?", ["Deleted", id]);
        res.json({ message: "Contact deleted" });
    } catch (error) {
        res.status(500).json({ message: "Database error", error });
    }
};
