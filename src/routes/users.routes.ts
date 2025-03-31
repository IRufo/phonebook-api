import { Router, Request, Response } from 'express';
import { ResultSetHeader } from 'mysql2';
import pool from '../config/db';

const userRouter = Router();

// Get all users
userRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const [users] = await pool.query('SELECT * FROM users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Create a user
userRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  const { first_name, last_name, email, password, role } = req.body;
  try {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [first_name, last_name, email, password, role]
    );

    res.json({ message: 'User created', userId: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Update a user
userRouter.put('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { first_name, last_name, email } = req.body;
  try {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE users SET first_name = ?, last_name = ?, email = ? WHERE id = ?',
      [first_name, last_name, email, id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ message: 'User updated' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete a user
userRouter.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM users WHERE id = ?', 
      [id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

export default userRouter;
