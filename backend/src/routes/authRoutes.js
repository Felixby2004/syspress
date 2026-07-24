import express from 'express';
import { register, verifyEmail, login, getProfile, updateProfile, changePassword, requestPasswordReset, forgotPassword, resetPassword } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/login', login);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);
router.post('/request-password-reset', requestPasswordReset);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;