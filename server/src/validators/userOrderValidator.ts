import Joi from 'joi';

export const createUserOrderSchema = Joi.object({
  userId: Joi.string().uuid().required().messages({
    'string.uuid': 'User ID must be a valid UUID',
    'any.required': 'User ID is required',
  }),
  gearId: Joi.string().uuid().required().messages({
    'string.uuid': 'Gear ID must be a valid UUID',
    'any.required': 'Gear ID is required',
  }),
  status: Joi.string().valid('waiting', 'arrived', 'shipped').required().messages({
    'any.only': 'Status must be one of: waiting, arrived, shipped',
    'any.required': 'Status is required',
  }),
  price: Joi.number().min(0).required().messages({
    'number.min': 'Price must be at least 0',
    'any.required': 'Price is required',
  }),
  publicNote: Joi.string().max(500).trim().allow('', null).optional(),
  privateNote: Joi.string().max(1000).trim().allow('', null).optional(),
  shippedDate: Joi.string().isoDate().allow('', null).optional(),
  shippedTime: Joi.string().pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).allow('', null).optional().messages({
    'string.pattern.base': 'Shipped time must be in HH:mm format',
  }),
});

export const updateUserOrderSchema = Joi.object({
  status: Joi.string().valid('waiting', 'arrived', 'shipped').optional(),
  price: Joi.number().min(0).optional(),
  publicNote: Joi.string().max(500).trim().allow('', null).optional(),
  privateNote: Joi.string().max(1000).trim().allow('', null).optional(),
  shippedDate: Joi.string().isoDate().allow('', null).optional(),
  shippedTime: Joi.string().pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).allow('', null).optional().messages({
    'string.pattern.base': 'Shipped time must be in HH:mm format',
  }),
});

