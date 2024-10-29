import Joi from 'joi';





// Schema for fetching an admin by ID
const getById = Joi.object({
    id: Joi.string().required(), // Assuming ID is a string (like ObjectId)
});

// Schema for soft deleting an admin by ID
const softDeleteAdminById = Joi.object({
    id: Joi.string().required(), // Assuming ID is a string
});

// Schema for admin login
const storeLogin = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

// Schema for changing admin password
const changePassword = {
    body: Joi.object().keys({
        currentPassword: Joi.string().required(),
        newPassword: Joi.string().min(6).required(),
    }),
};

export {
    getById,
    storeLogin,
    changePassword,
    softDeleteAdminById
};
