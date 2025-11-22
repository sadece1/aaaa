import { RowDataPacket } from 'mysql2';
import pool from '../config/database';
import { generateId, isEmpty } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

export interface Reference {
  id: string;
  title: string;
  image: string;
  location?: string | null;
  year?: string | null;
  description?: string | null;
  order_index: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * Get all references
 */
export const getReferences = async (): Promise<Reference[]> => {
  const [references] = await pool.execute<Array<any>>(
    'SELECT * FROM project_references ORDER BY order_index ASC, year DESC, created_at DESC'
  );
  return references;
};

/**
 * Get single reference by ID
 */
export const getReferenceById = async (id: string): Promise<Reference | null> => {
  const [references] = await pool.execute<Array<any>>(
    'SELECT * FROM project_references WHERE id = ?',
    [id]
  );

  if (isEmpty(references)) {
    return null;
  }

  return references[0];
};

/**
 * Create new reference
 */
export const createReference = async (data: {
  title: string;
  image: string;
  location?: string | null;
  year?: string | null;
  description?: string | null;
  order_index?: number;
}): Promise<Reference> => {
  const id = generateId();
  
  // Get max order_index if not provided
  let orderIndex = data.order_index;
  if (orderIndex === undefined) {
    const [result] = await pool.execute<RowDataPacket[]>(
      'SELECT COALESCE(MAX(order_index), 0) + 1 as max_order FROM project_references'
    );
    orderIndex = (result[0] as { max_order: number })?.max_order || 1;
  }

  await pool.execute(
    `INSERT INTO project_references (id, title, image, location, year, description, order_index)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.title,
      data.image,
      data.location || null,
      data.year || null,
      data.description || null,
      orderIndex,
    ]
  );

  const reference = await getReferenceById(id);
  if (!reference) {
    throw new AppError('Failed to create reference', 500);
  }

  logger.info(`Reference created: ${id}`);
  return reference;
};

/**
 * Update reference
 */
export const updateReference = async (id: string, data: Partial<Reference>): Promise<Reference> => {
  const existing = await getReferenceById(id);
  if (!existing) {
    throw new AppError('Reference not found', 404);
  }

  const updateFields: string[] = [];
  const updateValues: any[] = [];

  if (data.title !== undefined) {
    updateFields.push('title = ?');
    updateValues.push(data.title);
  }

  if (data.image !== undefined) {
    updateFields.push('image = ?');
    updateValues.push(data.image);
  }

  if (data.location !== undefined) {
    updateFields.push('location = ?');
    updateValues.push(data.location || null);
  }

  if (data.year !== undefined) {
    updateFields.push('year = ?');
    updateValues.push(data.year || null);
  }

  if (data.description !== undefined) {
    updateFields.push('description = ?');
    updateValues.push(data.description || null);
  }

  if (data.order_index !== undefined) {
    updateFields.push('order_index = ?');
    updateValues.push(data.order_index);
  }

  if (updateFields.length === 0) {
    return existing;
  }

  updateFields.push('updated_at = CURRENT_TIMESTAMP');
  updateValues.push(id);

  await pool.execute(
    `UPDATE project_references SET ${updateFields.join(', ')} WHERE id = ?`,
    updateValues
  );

  const updated = await getReferenceById(id);
  if (!updated) {
    throw new AppError('Failed to update reference', 500);
  }

  logger.info(`Reference updated: ${id}`);
  return updated;
};

/**
 * Delete reference
 */
export const deleteReference = async (id: string): Promise<void> => {
  const reference = await getReferenceById(id);
  if (!reference) {
    throw new AppError('Reference not found', 404);
  }

  await pool.execute('DELETE FROM project_references WHERE id = ?', [id]);
  logger.info(`Reference deleted: ${id}`);
};

