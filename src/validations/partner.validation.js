import Joi from 'joi';

// Schema for creating a new partner
const createPartner = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().optional(),
    roleId: Joi.string().required(),
    secondaryPhone: Joi.string().optional(), // Made optional if not required
    aadharNo: Joi.string().required(),
    panNo: Joi.string().required(),
});

// Schema for updating an existing partner
const updatePartner = Joi.object({
    name: Joi.string().optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().min(6).optional(),
    phone: Joi.string().optional(),
    roleId: Joi.string().optional(),
    storeId: Joi.string().optional(),
    secondaryPhone: Joi.string().optional(), 
    aadharNo: Joi.string().optional(),
    panNo: Joi.string().optional(),
});

// Schema for fetching a partner by ID
const getPartnerById = Joi.object({
    id: Joi.string().required(), // Assuming ID is a string (like ObjectId)
});

// Schema for soft deleting a partner by ID
const softDeletePartnerById = Joi.object({
    id: Joi.string().required(), // Assuming ID is a string
});

// Schema for partner login
const partnerLogin = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

// Schema for changing partner password
const changePassword = {
    body: Joi.object().keys({
        currentPassword: Joi.string().required(),
        newPassword: Joi.string().min(6).required(),
    }),
};

export {
    createPartner,
    updatePartner,
    getPartnerById,
    softDeletePartnerById,
    partnerLogin,
    changePassword,
};
