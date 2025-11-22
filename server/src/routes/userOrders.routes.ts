import { Router } from 'express';
import {
  getAllUserOrders,
  getSingleUserOrder,
  create,
  update,
  remove,
} from '../controllers/userOrderController';
import { authenticate, authorizeAdmin } from '../middleware/auth';
import { validate, createUserOrderSchema, updateUserOrderSchema } from '../validators';

const router = Router();

// Get all user orders (admin only, or filtered by userId)
router.get('/', authenticate, getAllUserOrders);

// Get single user order
router.get('/:id', authenticate, getSingleUserOrder);

// Create user order (admin only)
router.post('/', authenticate, authorizeAdmin, validate(createUserOrderSchema), create);

// Update user order (admin only)
router.put('/:id', authenticate, authorizeAdmin, validate(updateUserOrderSchema), update);

// Delete user order (admin only)
router.delete('/:id', authenticate, authorizeAdmin, remove);

export default router;

