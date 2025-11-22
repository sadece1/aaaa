import Joi from 'joi';

export const createBrandSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().required().messages({
    'string.min': 'Brand name must be at least 2 characters long',
    'string.max': 'Brand name must not exceed 100 characters',
    'any.required': 'Brand name is required',
  }),
  logo: Joi.string().uri().max(500).allow('', null).optional().messages({
    'string.uri': 'Logo must be a valid URL',
    'string.max': 'Logo URL must not exceed 500 characters',
  }),
});

export const updateBrandSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().optional(),
  logo: Joi.string().uri().max(500).allow('', null).optional().messages({
    'string.uri': 'Logo must be a valid URL',
    'string.max': 'Logo URL must not exceed 500 characters',
  }),
});

