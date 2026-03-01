import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import * as dotenv from 'dotenv';
import fs from 'fs';
import prisma from './lib/prisma'; // Using the singleton instance

// Route Imports
import authRoutes from './routes/auth';
import ticketRoutes from './routes/ticket';
import categoryRoutes from './routes/category';

dotenv.config();

const app = express();

// --- PRE-START CHECKS ---
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("📁 Created 'uploads' directory for student submissions.");
}

// --- MIDDLEWARE ---
// Updated CORS to be more resilient across different frontend environments
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- STATIC FILE SERVING ---
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
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

// Improved Global Error Handler to catch Network/Database issues specifically
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("🔥 Server Error:", err.stack);
  
  // Detect if the error is a Network/Database connection issue
  if (err.message.includes("unreachable network") || err.message.includes("DNS resolution")) {
    return res.status(503).json({
      message: "Database connection failed. Check your internet or whitelist your IP.",
      error: err.message
    });
  }

  res.status(500).json({ 
    message: "Internal Server Error",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

// --- NETWORK RESILIENT STARTUP ---
async function startServer() {
  try {
    console.log("⏳ Attempting to connect to MongoDB...");
    // Try to connect but don't crash the whole process if it fails initially
    await prisma.$connect();
    console.log("✅ Database connected successfully.");
  } catch (dbError: any) {
    console.error("⚠️ Database connection failed on startup.");
    console.error("Reason:", dbError.message);
    console.log("ℹ️ Server will still start, but API calls requiring the database will fail until connection is restored.");
  }

  app.listen(PORT, () => {
    console.log(`
  --------------------------------------------------
  🚀 ASTU Backend running on: http://localhost:${PORT}
  🖼️  Images available at: http://localhost:${PORT}/uploads/
  💡 Tip: If using campus WiFi, ensure port 27017 is open.
  --------------------------------------------------
    `);
  });
}

startServer();

export default app;