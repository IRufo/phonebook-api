import { Router, Request, Response } from 'express';
import { ResultSetHeader } from 'mysql2';
import pool from '../config/db';

const sharedContactRouter = Router();

// Get all shared contacts
sharedContactRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const [sharedContacts] = await pool.query('SELECT * FROM shared_contacts');
    res.json(sharedContacts);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Share a contact
sharedContactRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  const { contact_id, shared_with_user_id, owner_id } = req.body;
  try {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO shared_contacts (contact_id, shared_with_user_id, owner_id) VALUES (?, ?, ?)',
      [contact_id, shared_with_user_id, owner_id]
    );
    
    res.json({ message: 'Contact shared', shareId: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Unshare a contact
sharedContactRouter.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM shared_contacts WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Shared contact not found' });
      return;
    }

    res.json({ message: 'Contact unshared' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

export default sharedContactRouter;
