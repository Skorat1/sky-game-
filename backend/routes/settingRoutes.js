import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingController.js';
import { requireAdminAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Public: Get site configs / maintenance state
router.get('/', getSettings);

// Protected: Admin update settings
router.put('/', requireAdminAuth, updateSettings);
router.patch('/', requireAdminAuth, updateSettings);

export default router;
