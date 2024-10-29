import Joi from 'joi';

// Validation schema for creating a Role
const createRole = {
    body: Joi.object().keys({
        name: Joi.string().min(3).max(100).required(),  
        permissions: Joi.array().items(Joi.string()).min(1).optional(), 
        status: Joi.string().valid('Active', 'Blocked').required(),  
    }),
};

// Validation schema for fetching a Role by ID
const getRoleById = {
    params: Joi.object().keys({
        id: Joi.string().hex().length(24).required(),
    }),
};

// Validation schema for updating a Role by ID
const updateRoleById = {
    params: Joi.object().keys({
        id: Joi.string().hex().length(24).required(),
    }),
    body: Joi.object().keys({
        name: Joi.string().min(3).max(100).optional(),  // Optional name field
        permissions: Joi.array().items(Joi.string()).optional(),  // Optional array of permissions
        status: Joi.string().valid('Active', 'Blocked').optional(),  // Valid status values
        // Avatar will be handled via multer, so we do not validate it here in Joi
    }),
};

// Validation schema for soft deleting a Role by ID
const softDeleteRoleById = {
    params: Joi.object().keys({
        id: Joi.string().hex().length(24).required(),
    }),
};

export {
    createRole,
    getRoleById,
    updateRoleById,
    softDeleteRoleById,
};
