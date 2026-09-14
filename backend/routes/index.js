import { Router } from 'express';
import adminRoutes from './adminRoutes.js';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import gameRoutes from './gameRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import bannerRoutes from './bannerRoutes.js';
import submissionRoutes from './submissionRoutes.js';
import messageRoutes from './messageRoutes.js';
import settingRoutes from './settingRoutes.js';
import fairRoutes from './fairRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import { getHealth, getOnlineStats } from '../controllers/analyticsController.js';
import { resetDatabase } from '../controllers/settingController.js';
import { requireAdminAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Core health & public stats endpoints
router.get('/health', getHealth);
router.get('/stats/online', getOnlineStats);

// Protected Database Reset
router.post('/reset', requireAdminAuth, resetDatabase);

// Admin dedicated authentication & profile router
router.use('/admin', adminRoutes);

// Feature Sub-routers mounted on /api/*
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/games', gameRoutes);
router.use('/categories', categoryRoutes);
router.use('/banner', bannerRoutes);
router.use('/submissions', submissionRoutes);
router.use('/messages', messageRoutes);
router.use('/settings', settingRoutes);
router.use('/provably-fair', fairRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
