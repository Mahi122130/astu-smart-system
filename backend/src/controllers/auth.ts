import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role || "STUDENT",
      },
    });

    res.status(201).json({ 
      message: "User registered successfully", 
      user: { id: user.id, email: user.email } 
    });
  } catch (error) {
    console.error("Reg Error:", error);
    res.status(400).json({ error: "Registration failed." });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({ error: "Server configuration error: Missing Secret" });
      return;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      secret,
      { expiresIn: '1d' }
    );

    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (error: any) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllUsers = async (req: any, res: Response): Promise<void> => {
  try {
    if (req.user.role !== 'ADMIN') {
      res.status(403).json({ error: "Access denied. Admins only." });
      return;
    }
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const deleteUser = async (req: any, res: Response): Promise<void> => {
  try {
    if (req.user.role !== 'ADMIN') {
      res.status(403).json({ error: "Denied" });
      return;
    }
    await prisma.user.delete({ where: { id: req.params.userId } });
    res.json({ message: "User deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};