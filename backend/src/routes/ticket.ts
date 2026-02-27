import express from 'express';
import { authenticate } from '../middleware/auth';
import { 
  submitTicket, 
  getTicketHistory, 
  updateTicket, 
  getAnalytics, 
  askAIHelp,
  getChatHistory, // Added import
  getNotifications,
  markNotificationRead
} from '../controllers/ticket';

const router = express.Router();

// Notifications
router.get('/notifications', authenticate, getNotifications);
router.patch('/notifications/read', authenticate, markNotificationRead);
router.patch('/notifications/read/:id', authenticate, markNotificationRead);

// Tickets
router.get('/history', authenticate, getTicketHistory);
router.post('/submit', authenticate, submitTicket);
router.patch('/update/:ticketId', authenticate, updateTicket);

// AI Assistant
router.post('/ask-ai', authenticate, askAIHelp);
router.get('/chat-history', authenticate, getChatHistory); // New Route

// Admin
router.get('/analytics', authenticate, getAnalytics);

export default router;