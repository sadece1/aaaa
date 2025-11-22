import { Router } from 'express';
import {
  getAllBrands,
  getSingleBrand,
  create,
  update,
  remove,
} from '../controllers/brandController';
import { authenticate, authorizeAdmin } from '../middleware/auth';
import { validate, createBrandSchema, updateBrandSchema } from '../validators';

const router = Router();

router.get('/', getAllBrands);
router.get('/:id', getSingleBrand);
router.post('/', authenticate, authorizeAdmin, validate(createBrandSchema), create);
router.put('/:id', authenticate, authorizeAdmin, validate(updateBrandSchema), update);
router.delete('/:id', authenticate, authorizeAdmin, remove);

export default router;

