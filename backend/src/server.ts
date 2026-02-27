import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/auth';
import ticketRoutes from './routes/ticket';

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 ASTU Backend running on http://localhost:${PORT}`);
});