import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import * as dotenv from 'dotenv';
import fs from 'fs';

// Route Imports
import authRoutes from './routes/auth';
import ticketRoutes from './routes/ticket';
import categoryRoutes from './routes/category';

dotenv.config();

const app = express();

// --- PRE-START CHECKS ---
// Ensure the 'uploads' directory exists so the server doesn't crash on first upload
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("📁 Created 'uploads' directory for student submissions.");
}

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- STATIC FILE SERVING (CRITICAL FOR IMAGES) ---
/** * This makes files in your /uploads folder available at:
 * http://localhost:5000/uploads/filename.jpg
 * Using process.cwd() is safer than __dirname when using TypeScript/Build tools.
 */
app.use('/uploads', express.static(uploadDir));

// --- API ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/categories', categoryRoutes);

// Health Check / Root Route
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: "ASTU Smart Complaint API is Online", 
    version: "1.0.0",
    prisma_version: "6" 
  });
});

// --- ERROR HANDLING ---
// Catch 404s
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("🔥 Server Error:", err.stack);
  res.status(500).json({ 
    message: "Internal Server Error",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  --------------------------------------------------
  🚀 ASTU Backend running on: http://localhost:${PORT}
  🖼️  Images available at: http://localhost:${PORT}/uploads/
  --------------------------------------------------
  `);
});

export default app;