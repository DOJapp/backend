import Joi from 'joi';


// Validation schema for updating a Category by ID
const createCategory = {
    body: Joi.object().keys({
        title: Joi.string().min(3).max(100).required(),  // Optional, but must meet length requirements
        status: Joi.string().valid('Active', 'Blocked').required(),  // Valid status values
        // Image will be handled via multer, so we do not validate it here in Joi
    }),
};



// Validation schema for fetching a Category by ID
const getCategoryById = {
    params: Joi.object().keys({
        id: Joi.string().hex().length(24).required(),
    }),
};

// Validation schema for updating a Category by ID
const updateCategoryById = {
    params: Joi.object().keys({
        id: Joi.string().hex().length(24).required(),
    }),
    body: Joi.object().keys({
        title: Joi.string().min(3).max(100).required(),  // Optional, but must meet length requirements
        status: Joi.string().valid('Active', 'Blocked').optional(),  // Valid status values
        // Image will be handled via multer, so we do not validate it here in Joi
    }),
};

// Validation schema for soft deleting a Category by ID
const softDeleteCategoryById = {
    params: Joi.object().keys({
        id: Joi.string().hex().length(24).required(),
    }),
};

export {
    createCategory,
    getCategoryById,
    updateCategoryById,
    softDeleteCategoryById,
};
