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
import { upload } from '../middleware/upload';

const router = Router();

// Multer middleware for parsing FormData (no file upload, just text fields)
const parseFormData = upload.none();

router.get('/', validateQuery(gearFiltersSchema), getAllGear);
router.get('/search', search);
router.get('/by-category/:categoryId', getByCategory);
router.get('/recommended/:id', getRecommended);
router.get('/:id', getSingleGear);
router.post('/', authenticate, parseFormData, validate(createGearSchema), create);
router.put('/:id', authenticate, parseFormData, validate(updateGearSchema), update);
router.delete('/:id', authenticate, remove);

export default router;













