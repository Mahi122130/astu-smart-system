import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all categories from MongoDB
router.get('/', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: "Failed to load categories" });
  }
});

// Add new category to MongoDB
router.post('/', async (req: Request, res: Response) => {
  const { name } = req.body;
  try {
    const category = await prisma.category.create({
      data: { name: name.trim() }
    });
    res.json(category);
  } catch (err: any) {
    if (err.code === 'P2002') return res.status(400).json({ error: "Category already exists" });
    res.status(500).json({ error: "Database error" });
  }
});

// Delete category from MongoDB
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

export default router;