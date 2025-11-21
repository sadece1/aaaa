import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getGear,
  getGearById,
  createGear,
  updateGear,
  deleteGear,
  searchGear,
  getGearByCategory,
  getRecommendedGear,
} from '../services/gearService';
import { asyncHandler } from '../middleware/errorHandler';
import { parseDate } from '../utils/helpers';
import { createGearSchema, updateGearSchema } from '../validators';

/**
 * Get all gear
 */
export const getAllGear = asyncHandler(async (req: Request, res: Response) => {
  const result = await getGear(req.query);

  res.status(200).json({
    success: true,
    data: result.data.map((g: any) => ({
      ...g,
      created_at: parseDate(g.created_at),
      updated_at: parseDate(g.updated_at),
    })),
    pagination: result.pagination,
  });
});

/**
 * Get single gear
 */
export const getSingleGear = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const gear = await getGearById(id);

  if (!gear) {
    res.status(404).json({
      success: false,
      message: 'Gear not found',
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      ...gear,
      created_at: parseDate(gear.created_at),
      updated_at: parseDate(gear.updated_at),
    },
  });
});

/**
 * Helper to parse FormData or JSON body
 */
const parseGearData = (req: Request): any => {
  // If Content-Type is multipart/form-data, parse FormData
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    const body: any = {};
    
    // Parse FormData fields (camelCase to snake_case conversion)
    if (req.body.name) body.name = req.body.name;
    if (req.body.description) body.description = req.body.description;
    
    // Handle category_id - can be categoryId or category_id
    if (req.body.categoryId) {
      body.category_id = req.body.categoryId;
    } else if (req.body.category_id) {
      body.category_id = req.body.category_id;
    }
    
    // Handle images - can be image_0, image_1, etc. or images array
    const images: string[] = [];
    let index = 0;
    while (req.body[`image_${index}`]) {
      const url = req.body[`image_${index}`];
      if (url && typeof url === 'string' && url.trim()) {
        images.push(url.trim());
      }
      index++;
    }
    if (images.length > 0) {
      body.images = images;
    } else if (req.body.images) {
      body.images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }
    
    // Handle price_per_day
    if (req.body.pricePerDay) {
      body.price_per_day = parseFloat(req.body.pricePerDay);
    } else if (req.body.price_per_day) {
      body.price_per_day = parseFloat(req.body.price_per_day);
    }
    
    // Handle deposit
    if (req.body.deposit !== undefined) {
      body.deposit = req.body.deposit ? parseFloat(req.body.deposit) : null;
    }
    
    // Handle status
    if (req.body.status) {
      body.status = req.body.status;
    }
    
    // Handle available
    if (req.body.available !== undefined) {
      body.available = req.body.available === 'true' || req.body.available === true;
    }
    
    // Handle optional fields
    if (req.body.brand) body.brand = req.body.brand;
    if (req.body.color) body.color = req.body.color;
    if (req.body.specifications) {
      body.specifications = typeof req.body.specifications === 'string' 
        ? JSON.parse(req.body.specifications) 
        : req.body.specifications;
    }
    if (req.body.recommendedProducts) {
      body.recommended_products = typeof req.body.recommendedProducts === 'string'
        ? JSON.parse(req.body.recommendedProducts)
        : req.body.recommendedProducts;
    } else if (req.body.recommended_products) {
      body.recommended_products = typeof req.body.recommended_products === 'string'
        ? JSON.parse(req.body.recommended_products)
        : req.body.recommended_products;
    }
    
    return body;
  }
  
  // Otherwise, return body as-is (JSON)
  return req.body;
};

/**
 * Create gear
 */
export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  // Parse FormData or JSON
  const gearData = parseGearData(req);
  
  // Validate parsed data
  const { error, value } = createGearSchema.validate(gearData, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });
  
  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));
    
    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors,
    });
    return;
  }
  
  const gear = await createGear(value, req.user.id);

  res.status(201).json({
    success: true,
    message: 'Gear created successfully',
    data: {
      ...gear,
      created_at: parseDate(gear.created_at),
      updated_at: parseDate(gear.updated_at),
    },
  });
});

/**
 * Update gear
 */
export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  const { id } = req.params;
  const isAdmin = req.user.role === 'admin';

  // Parse FormData or JSON
  const gearData = parseGearData(req);
  
  // Validate parsed data
  const { error, value } = updateGearSchema.validate(gearData, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });
  
  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));
    
    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors,
    });
    return;
  }
  
  const gear = await updateGear(id, value, req.user.id, isAdmin);

  res.status(200).json({
    success: true,
    message: 'Gear updated successfully',
    data: {
      ...gear,
      created_at: parseDate(gear.created_at),
      updated_at: parseDate(gear.updated_at),
    },
  });
});

/**
 * Delete gear
 */
export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  const { id } = req.params;
  const isAdmin = req.user.role === 'admin';

  await deleteGear(id, req.user.id, isAdmin);

  res.status(200).json({
    success: true,
    message: 'Gear deleted successfully',
  });
});

/**
 * Search gear
 */
export const search = asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    res.status(400).json({
      success: false,
      message: 'Search query is required',
    });
    return;
  }

  const gear = await searchGear(q);

  res.status(200).json({
    success: true,
    data: gear.map((g: any) => ({
      ...g,
      created_at: parseDate(g.created_at),
      updated_at: parseDate(g.updated_at),
    })),
  });
});

/**
 * Get gear by category
 */
export const getByCategory = asyncHandler(async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  const gear = await getGearByCategory(categoryId);

  res.status(200).json({
    success: true,
    data: gear.map((g: any) => ({
      ...g,
      created_at: parseDate(g.created_at),
      updated_at: parseDate(g.updated_at),
    })),
  });
});

/**
 * Get recommended gear
 */
export const getRecommended = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const gear = await getRecommendedGear(id);

  res.status(200).json({
    success: true,
    data: gear.map((g: any) => ({
      ...g,
      created_at: parseDate(g.created_at),
      updated_at: parseDate(g.updated_at),
    })),
  });
});













