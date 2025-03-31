import { Router, Request, Response } from 'express';
import { ResultSetHeader } from 'mysql2';
import pool from '../config/db';

const contactRouter = Router();

// Get all contacts
contactRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const [contacts] = await pool.query('SELECT * FROM contacts');
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Create a contact
contactRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  const { first_name, last_name, phone, email, owner_id } = req.body;
  try {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO contacts (first_name, last_name, phone, email, owner_id) VALUES (?, ?, ?, ?, ?)',
      [first_name, last_name, phone, email, owner_id]
    );
    res.json({ message: 'Contact created', contactId: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Update a contact
contactRouter.put('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { first_name, last_name, phone, email } = req.body;
  try {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE contacts SET first_name = ?, last_name = ?, phone = ?, email = ? WHERE id = ?',
      [first_name, last_name, phone, email, id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }

    res.json({ message: 'Contact updated' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete a contact
contactRouter.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM contacts WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }

    res.json({ message: 'Contact deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

export default contactRouter;
