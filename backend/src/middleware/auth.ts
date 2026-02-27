import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticate = (req: any, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Token required" });

  try {
    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, secret);
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};