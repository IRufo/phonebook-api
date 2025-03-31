import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import pool from "../config/db";
import { RowDataPacket } from "mysql2/promise";

interface AuthRequest extends Request {
  user?: { id: number; role: string };
}

export const authenticateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number; role: string };

    // Check if user exists in the database
    const [users] = await pool.query<RowDataPacket[]>(
      "SELECT id, role, status FROM users WHERE id = ?",
      [decoded.id]
    );

    if (users.length === 0) {
      res.status(401).json({ message: "Unauthorized: User does not exist" });
      return;
    }

    const user = users[0];

    // Optional: Check if user is active
    if (user.status !== 'Active') {
      res.status(403).json({ message: "Unauthorized: User is inactive" });
      return;
    }

    // Attach user details to the request object
    req.user = { id: user.id, role: user.role };
    next();
  } catch (error) {
    res.status(403).json({ message: "Unauthorized: Invalid token" });
  }
};
