// routes/category.ts
import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma'; // Ensure prisma client is correctly exported from lib/prisma

const router = Router();

/**
 * GET /api/categories
 * Fetch all categories in alphabetical order
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' } // Sort alphabetically
    });
    res.json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Failed to load categories" });
  }
});

/**
 * POST /api/categories
 * Add a new category
 */
router.post('/', async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Category name is required" });

  try {
    const category = await prisma.category.create({
      data: { name: name.trim() }
    });
    res.json(category);
  } catch (err: any) {
    // Prisma unique constraint error
    if (err.code === 'P2002') {
      return res.status(400).json({ error: "Category already exists" });
    }
    console.error("Error creating category:", err);
    res.status(500).json({ error: "Database error" });
  }
});

/**
 * DELETE /api/categories/:id
 * Delete a category by id
 */
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.category.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});

export default router;