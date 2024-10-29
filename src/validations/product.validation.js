import Joi from 'joi';

// Validation schema for creating a new Product
const createProduct = {
    body: Joi.object().keys({
        name: Joi.string().required().max(255),
        description: Joi.string().required(),
        categoryId: Joi.string().hex().length(24).required(),
        deliveryMode: Joi.string().valid('instant', 'scheduled').required(),
        quantity: Joi.number().required().min(0),
        price: Joi.number().required().min(0),
        discount: Joi.number().optional().min(0),
        status: Joi.string().valid('Active', 'Blocked').required(),
    }),
};

// Validation schema for fetching a Product by ID
const getProductById = {
    params: Joi.object().keys({
        id: Joi.string().hex().length(24).required(),
    }),
};

// Validation schema for updating a Product by ID
const updateProductById = {
    params: Joi.object().keys({
        id: Joi.string().hex().length(24).required(),
    }),
    body: Joi.object().keys({
        name: Joi.string().optional().max(255),
        description: Joi.string().optional(),
        categoryId: Joi.string().hex().length(24).optional(),
        deliveryMode: Joi.string().valid('instant', 'scheduled').optional(),
        quantity: Joi.number().optional().min(0),
        price: Joi.number().optional().min(0),
        discount: Joi.number().optional().min(0),
        status: Joi.string().valid('Active', 'Blocked').optional(),
    }),
};

// Validation schema for soft deleting a Product by ID
const softDeleteProductById = {
    params: Joi.object().keys({
        id: Joi.string().hex().length(24).required(),
    }),
};

export {
    createProduct,
    getProductById,
    updateProductById,
    softDeleteProductById,
};
