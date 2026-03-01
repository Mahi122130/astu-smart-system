// routes/category.ts
import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

/**
 * GET /api/categories
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Failed to load categories" });
  }
});

/**
 * POST /api/categories
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { name } = req.body;
  
  if (!name) {
    res.status(400).json({ error: "Category name is required" });
    return;
  }

  try {
    const category = await prisma.category.create({
      data: { name: name.trim() }
    });
    res.json(category);
  } catch (err: any) {
    if (err.code === 'P2002') {
      res.status(400).json({ error: "Category already exists" });
      return;
    }
    console.error("Error creating category:", err);
    res.status(500).json({ error: "Database error" });
  }
});

/**
 * DELETE /api/categories/:id
 * Fixed: Explicitly handle the 'id' param type for Prisma
 */
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: "Category ID is required" });
      return;
    }

    await prisma.category.delete({ 
      where: { id: String(id) } 
    });
    
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).json({ error: "Delete failed. It might not exist." });
  }
});

export default router;