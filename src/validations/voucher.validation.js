import Joi from 'joi';

// Validation schema for creating a Voucher
const createVoucher = {
    body: Joi.object().keys({
        title: Joi.string().required(),
        description: Joi.string().required(),
        discountValue: Joi.number().positive().required(),
        discountType: Joi.string().valid('Percentage', 'Fixed').required(), // Added discountType
        usagePerUser: Joi.number().integer().min(0).required(), // Added usagePerUser
        minOrderValue: Joi.number().positive().required(), // Added minOrderValue
        status: Joi.string().valid('Active', 'Blocked', 'Redeemed', 'Expired').optional(),
        expiryDate: Joi.date().optional(), // Optional expiryDate for creation
    }),
};


// Validation schema for fetching a Voucher by ID
const getById = {
    params: Joi.object().keys({
        id: Joi.string().hex().length(24).required(),
    }),
};

// Validation schema for redeeming a Voucher
const redeem = {
    body: Joi.object().keys({
        voucherCode: Joi.string().required(),
    }),
};

// Validation schema for updating a Voucher by ID
const updateById = {
    params: Joi.object().keys({
        id: Joi.string().hex().length(24).required(),
    }),
    body: Joi.object().keys({
        title: Joi.string().required(),
        description: Joi.string().required(),
        discountValue: Joi.number().positive().optional(),
        discountType: Joi.string().valid('Percentage', 'Fixed').optional(), // Added discountType
        usagePerUser: Joi.number().integer().min(0).optional(), // Added usagePerUser
        minOrderValue: Joi.number().positive().optional(), // Added minOrderValue
        status: Joi.string().valid('Active', 'Blocked', 'Redeemed', 'Expired').optional(),
    }),
};

// Validation schema for updating a Voucher's expiry date
const updateExpiryDateById = {
    params: Joi.object().keys({
        id: Joi.string().hex().length(24).required(),
    }),
    body: Joi.object().keys({
        expiryDate: Joi.date().required(),
    }),
};

// Validation schema for soft deleting a Voucher by ID
const softDeleteById = {
    params: Joi.object().keys({
        id: Joi.string().hex().length(24).required(),
    }),
};

export {
    createVoucher,
    getById,
    updateById,
    updateExpiryDateById,
    softDeleteById,
    redeem
};
