import pool from '../config/database';
import { generateId, isEmpty } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

export interface Brand {
  id: string;
  name: string;
  logo?: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Get all brands
 */
export const getBrands = async (): Promise<Brand[]> => {
  const [brands] = await pool.execute<Array<any>>(
    'SELECT * FROM brands ORDER BY name ASC'
  );
  return brands;
};

/**
 * Get single brand by ID
 */
export const getBrandById = async (id: string): Promise<Brand | null> => {
  const [brands] = await pool.execute<Array<any>>(
    'SELECT * FROM brands WHERE id = ?',
    [id]
  );

  if (isEmpty(brands)) {
    return null;
  }

  return brands[0];
};

/**
 * Create new brand
 */
export const createBrand = async (data: {
  name: string;
  logo?: string | null;
}): Promise<Brand> => {
  const id = generateId();
  
  // Check if brand with same name exists
  const existing = await pool.execute<Array<any>>(
    'SELECT id FROM brands WHERE name = ?',
    [data.name]
  );
  
  if (!isEmpty(existing[0])) {
    throw new AppError('Brand with this name already exists', 409);
  }

  await pool.execute(
    `INSERT INTO brands (id, name, logo)
     VALUES (?, ?, ?)`,
    [id, data.name, data.logo || null]
  );

  const brand = await getBrandById(id);
  if (!brand) {
    throw new AppError('Failed to create brand', 500);
  }

  logger.info(`Brand created: ${id}`);
  return brand;
};

/**
 * Update brand
 */
export const updateBrand = async (id: string, data: Partial<Brand>): Promise<Brand> => {
  const existing = await getBrandById(id);
  if (!existing) {
    throw new AppError('Brand not found', 404);
  }

  const updateFields: string[] = [];
  const updateValues: any[] = [];

  if (data.name !== undefined) {
    // Check if another brand with the same name exists
    const [duplicate] = await pool.execute<Array<any>>(
      'SELECT id FROM brands WHERE name = ? AND id != ?',
      [data.name, id]
    );
    
    if (!isEmpty(duplicate[0])) {
      throw new AppError('Brand with this name already exists', 409);
    }
    
    updateFields.push('name = ?');
    updateValues.push(data.name);
  }

  if (data.logo !== undefined) {
    updateFields.push('logo = ?');
    updateValues.push(data.logo || null);
  }

  if (updateFields.length === 0) {
    return existing;
  }

  updateFields.push('updated_at = CURRENT_TIMESTAMP');
  updateValues.push(id);

  await pool.execute(
    `UPDATE brands SET ${updateFields.join(', ')} WHERE id = ?`,
    updateValues
  );

  const updated = await getBrandById(id);
  if (!updated) {
    throw new AppError('Failed to update brand', 500);
  }

  logger.info(`Brand updated: ${id}`);
  return updated;
};

/**
 * Delete brand
 */
export const deleteBrand = async (id: string): Promise<void> => {
  const brand = await getBrandById(id);
  if (!brand) {
    throw new AppError('Brand not found', 404);
  }

  await pool.execute('DELETE FROM brands WHERE id = ?', [id]);
  logger.info(`Brand deleted: ${id}`);
};

