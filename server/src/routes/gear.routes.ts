import { Router } from 'express';
import {
  getAllGear,
  getSingleGear,
  create,
  update,
  remove,
  search,
  getByCategory,
  getRecommended,
} from '../controllers/gearController';
import { authenticate } from '../middleware/auth';
import { validate, validateQuery, createGearSchema, updateGearSchema, gearFiltersSchema } from '../validators';

const router = Router();

router.get('/', validateQuery(gearFiltersSchema), getAllGear);
router.get('/search', search);
router.get('/by-category/:categoryId', getByCategory);
router.get('/recommended/:id', getRecommended);
router.get('/:id', getSingleGear);
// Note: validate middleware is skipped for FormData requests
// Validation is done in controller after parsing FormData
router.post('/', authenticate, create);
router.put('/:id', authenticate, update);
router.delete('/:id', authenticate, remove);

export default router;













