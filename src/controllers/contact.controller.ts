import { Request, Response } from "express";
import pool from "../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

interface AuthRequest extends Request {
    user?: { id: number; role: string };
}

export const getContacts = async (req: Request, res: Response): Promise<void> => {
    try {
        const [contacts] = await pool.query<RowDataPacket[]>("SELECT * FROM contacts");
        res.json({ success: true, contacts });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database error", error });
    }
};

export const getContactById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const [contact] = await pool.query<RowDataPacket[]>("SELECT * FROM contacts WHERE id = ?", [id]);
        if (!contact.length) {
            res.status(404).json({ success: false, message: "Contact not found" });
            return; 
        }
        res.json({ success: true, contact: contact[0] }); 
    } catch (error) {
        res.status(500).json({ success: false, message: "Database error", error });
    }
};

export const addContact = async (req: AuthRequest, res: Response): Promise<void> => {
    const { first_name, last_name, contact_number, email } = req.body;
    const owner_id = req.user?.id;
    const profile_photo_url = req.file ? req.file.filename : null;

    if (!owner_id || !first_name || !last_name || !contact_number || !email) {
        res.status(400).json({ success: false, message: "All required fields must be provided" });
        return;
    }

    try {
        const [result] = await pool.query<ResultSetHeader>(
            "INSERT INTO contacts (owner_id, first_name, last_name, contact_number, email, profile_photo_url) VALUES (?, ?, ?, ?, ?, ?)",
            [owner_id, first_name, last_name, contact_number, email, profile_photo_url]
        );
        res.status(201).json({ success: true, message: "Contact added successfully", contactId: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database error", error });
    }
};

export const updateContact = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { first_name, last_name, contact_number, email } = req.body;
    const profile_photo_url = req.file ? req.file.filename : undefined;

    const { setClause, values } = Object.entries({ first_name, last_name, contact_number, email, profile_photo_url })
    .reduce(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc.setClause.push(`${key} = ?`);
          acc.values.push(value);
        }
        return acc;
      },
      { setClause: [], values: [] } as { setClause: string[]; values: any[] }
    );
  
  if (setClause.length === 0) {
    res.status(400).json({ success: false, message: "No valid fields provided to update" });
    return;
  }
  
  try {
    await pool.query(
      `UPDATE contacts SET ${setClause.join(", ")} WHERE id = ?`,
      [...values, id]
    );
    res.json({ success: true, message: "Contact updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Database error", error });
  }
};

export const deleteContact = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        await pool.query<ResultSetHeader>(
            "UPDATE users SET contacts = ? WHERE id = ?", ["Deleted", id]);
           
        await pool.query<ResultSetHeader>(
            "UPDATE shared_contacts SET status = ? WHERE contact_id = ?",
            ["Deleted", id]
        );
        res.json({ success: true, message: "Contact deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database error", error });
    }
};
