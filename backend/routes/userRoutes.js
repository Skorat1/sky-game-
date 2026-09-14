import { Router } from 'express';
import { getUsers, getUserById, createUser, deleteUser, updateUser } from '../controllers/userController.js';
import { requireAdminAuth } from '../middleware/authMiddleware.js';

const router = Router();

// All user management operations require Admin authorization
router.get('/', requireAdminAuth, getUsers);
router.get('/:id', requireAdminAuth, getUserById);
router.post('/', requireAdminAuth, createUser);
router.patch('/:id', requireAdminAuth, updateUser);
router.put('/:id', requireAdminAuth, updateUser);
router.delete('/:id', requireAdminAuth, deleteUser);

export default router;
