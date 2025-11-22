import { Router } from 'express';
import { getAllReservations, getSingleReservation } from '../controllers/reservationController';
import { authenticate } from '../middleware/auth';

const router = Router();

// User orders are actually reservations
// This endpoint provides an alias for /api/reservations
// All routes require authentication
router.use(authenticate);

router.get('/', getAllReservations);
router.get('/:id', getSingleReservation);

export default router;

