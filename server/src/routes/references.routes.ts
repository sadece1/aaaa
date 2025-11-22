import { Router } from 'express';
import {
  getAllReferences,
  getSingleReference,
  create,
  update,
  remove,
} from '../controllers/referenceController';
import { authenticate, authorizeAdmin } from '../middleware/auth';
import { validate, createReferenceSchema, updateReferenceSchema } from '../validators';

const router = Router();

router.get('/', getAllReferences);
router.get('/:id', getSingleReference);
router.post('/', authenticate, authorizeAdmin, validate(createReferenceSchema), create);
router.put('/:id', authenticate, authorizeAdmin, validate(updateReferenceSchema), update);
router.delete('/:id', authenticate, authorizeAdmin, remove);

export default router;

