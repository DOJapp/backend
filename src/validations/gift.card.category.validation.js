import Joi from 'joi';

// Validation schema for creating a gift card category
const createGiftCardCategory = {
    body: Joi.object().keys({
        name: Joi.string().min(3).max(100).required(),  // Name is required and must meet length requirements
        description: Joi.string().max(500).optional(),  // Description is optional, max length 500
        status: Joi.string().valid('Active', 'Blocked').required(),  // Valid status values ('Active', 'Blocked')
    }),
};

// Validation schema for fetching a category by ID
const getCategoryById = {
    params: Joi.object().keys({
        id: Joi.string().hex().length(24).required(),  // ID must be a valid 24-character hex string
    }),
};

// Validation schema for updating a category by ID
const updateCategoryById = {
    params: Joi.object().keys({
        id: Joi.string().hex().length(24).required(),  // ID must be a valid 24-character hex string
    }),
    body: Joi.object().keys({
        name: Joi.string().min(3).max(100).optional(),  // Name is optional but must meet length requirements if provided
        description: Joi.string().max(500).optional(),  // Description is optional, max length 500
        status: Joi.string().valid('Active', 'Blocked').optional(),  // Status is optional but must be 'Active' or 'Blocked' if provided
    }),
};

// Validation schema for soft deleting a category by ID
const softDeleteCategoryById = {
    params: Joi.object().keys({
        id: Joi.string().hex().length(24).required(),  // ID must be a valid 24-character hex string
    }),
};

export {
    createGiftCardCategory,
    getCategoryById,
    updateCategoryById,
    softDeleteCategoryById,
};
