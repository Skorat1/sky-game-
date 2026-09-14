import { Router } from 'express';
import { getBanner, updateBanner, deleteBanner } from '../controllers/bannerController.js';
import { requireAdminAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Public Banner Discovery
router.get('/', getBanner);

// Protected Admin Banner Operations
router.put('/', requireAdminAuth, updateBanner);
router.delete('/', requireAdminAuth, deleteBanner);

export default router;
