import Joi from 'joi';

export const createReferenceSchema = Joi.object({
  title: Joi.string().min(2).max(200).trim().required().messages({
    'string.min': 'Title must be at least 2 characters long',
    'string.max': 'Title must not exceed 200 characters',
    'any.required': 'Title is required',
  }),
  image: Joi.string().uri().max(500).required().messages({
    'string.uri': 'Image must be a valid URL',
    'string.max': 'Image URL must not exceed 500 characters',
    'any.required': 'Image is required',
  }),
  location: Joi.string().max(200).trim().allow('', null).optional(),
  year: Joi.string().max(10).trim().allow('', null).optional(),
  description: Joi.string().max(1000).trim().allow('', null).optional(),
  order_index: Joi.number().integer().min(0).optional(),
});

export const updateReferenceSchema = Joi.object({
  title: Joi.string().min(2).max(200).trim().optional(),
  image: Joi.string().uri().max(500).optional().messages({
    'string.uri': 'Image must be a valid URL',
    'string.max': 'Image URL must not exceed 500 characters',
  }),
  location: Joi.string().max(200).trim().allow('', null).optional(),
  year: Joi.string().max(10).trim().allow('', null).optional(),
  description: Joi.string().max(1000).trim().allow('', null).optional(),
  order_index: Joi.number().integer().min(0).optional(),
});

