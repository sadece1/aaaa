import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getReferences,
  getReferenceById,
  createReference,
  updateReference,
  deleteReference,
} from '../services/referenceService';
import { asyncHandler } from '../middleware/errorHandler';
import { parseDate } from '../utils/helpers';

export const getAllReferences = asyncHandler(async (req: Request, res: Response) => {
  const references = await getReferences();
  res.status(200).json({
    success: true,
    data: references.map((r: any) => ({
      ...r,
      created_at: parseDate(r.created_at),
      updated_at: parseDate(r.updated_at),
    })),
  });
});

export const getSingleReference = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const reference = await getReferenceById(id);
  if (!reference) {
    res.status(404).json({ success: false, message: 'Reference not found' });
    return;
  }
  res.status(200).json({
    success: true,
    data: {
      ...reference,
      created_at: parseDate(reference.created_at),
      updated_at: parseDate(reference.updated_at),
    },
  });
});

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reference = await createReference(req.body);
  res.status(201).json({
    success: true,
    message: 'Reference created successfully',
    data: {
      ...reference,
      created_at: parseDate(reference.created_at),
      updated_at: parseDate(reference.updated_at),
    },
  });
});

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const reference = await updateReference(id, req.body);
  res.status(200).json({
    success: true,
    message: 'Reference updated successfully',
    data: {
      ...reference,
      created_at: parseDate(reference.created_at),
      updated_at: parseDate(reference.updated_at),
    },
  });
});

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  await deleteReference(id);
  res.status(200).json({ success: true, message: 'Reference deleted successfully' });
});

