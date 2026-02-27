import express from 'express';
import { register, login, getAllUsers, deleteUser } from '../controllers/auth';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// Admin User Management
router.get('/users', authenticate, getAllUsers);
router.delete('/users/:userId', authenticate, deleteUser);

export default router;