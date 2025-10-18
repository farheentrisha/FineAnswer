// backend/routes/authRoutes.js
import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route POST /api/auth/register
router.post('/register', registerUser);

// @route POST /api/auth/login
router.post('/login', loginUser);

// ✅ PROTECTED ROUTE using middleware
router.get('/me', protect, (req, res) => {
    res.json({
        message: 'Access granted',
        user: req.user
    });
});

export default router;
