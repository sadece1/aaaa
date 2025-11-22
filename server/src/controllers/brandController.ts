import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
} from '../services/brandService';
import { asyncHandler } from '../middleware/errorHandler';
import { parseDate } from '../utils/helpers';

export const getAllBrands = asyncHandler(async (req: Request, res: Response) => {
  const brands = await getBrands();
  res.status(200).json({
    success: true,
    data: brands.map((b: any) => ({
      ...b,
      created_at: parseDate(b.created_at),
      updated_at: parseDate(b.updated_at),
    })),
  });
});

export const getSingleBrand = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const brand = await getBrandById(id);
  if (!brand) {
    res.status(404).json({ success: false, message: 'Brand not found' });
    return;
  }
  res.status(200).json({
    success: true,
    data: {
      ...brand,
      created_at: parseDate(brand.created_at),
      updated_at: parseDate(brand.updated_at),
    },
  });
});

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const brand = await createBrand(req.body);
  res.status(201).json({
    success: true,
    message: 'Brand created successfully',
    data: {
      ...brand,
      created_at: parseDate(brand.created_at),
      updated_at: parseDate(brand.updated_at),
    },
  });
});

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const brand = await updateBrand(id, req.body);
  res.status(200).json({
    success: true,
    message: 'Brand updated successfully',
    data: {
      ...brand,
      created_at: parseDate(brand.created_at),
      updated_at: parseDate(brand.updated_at),
    },
  });
});

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  await deleteBrand(id);
  res.status(200).json({ success: true, message: 'Brand deleted successfully' });
});

