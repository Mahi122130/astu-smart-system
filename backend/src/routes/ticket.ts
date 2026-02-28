import express from 'express';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload'; // Make sure this path to your multer config is correct
import { 
  submitTicket, 
  getTicketHistory, 
  updateTicket, 
  getAnalytics, 
  askAIHelp,
  getChatHistory,
  getNotifications,
  markNotificationRead
} from '../controllers/ticket';

const router = express.Router();

// --- NOTIFICATIONS ---
router.get('/notifications', authenticate, getNotifications);
router.patch('/notifications/read', authenticate, markNotificationRead);
router.patch('/notifications/read/:id', authenticate, markNotificationRead);

// --- TICKETS ---
router.get('/history', authenticate, getTicketHistory);

/**
 * FIX: Added upload.single('attachment') middleware.
 * 'attachment' must match the key used in your frontend FormData:
 * formData.append('attachment', file);
 */
router.post('/submit', authenticate, upload.single('attachment'), submitTicket);

router.patch('/update/:ticketId', authenticate, updateTicket);

// --- AI ASSISTANT ---
router.post('/ask-ai', authenticate, askAIHelp);
router.get('/chat-history', authenticate, getChatHistory);

// --- ADMIN ---
router.get('/analytics', authenticate, getAnalytics);

export default router;