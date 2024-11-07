import Joi from 'joi';

// Schema for creating a new partner
const createPartner = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().optional(),
    roleId: Joi.string().required(),
    secondaryPhone: Joi.string().optional(),
    aadharNo: Joi.string().required(),
    panNo: Joi.string().required(),
});

// Schema for updating an existing partner
const updatePartnerBasicDetailsById = {
    params: Joi.object({
        id: Joi.string().hex().length(24).required(),
    }),
    body: Joi.object({
        name: Joi.string().max(255).optional(),
        email: Joi.string().email().optional(),
        phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
        secondaryPhone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
        status: Joi.string().valid('Active', 'Blocked').optional(),
    }),
};

const updateGstDetailsById = {
    params: Joi.object({
        id: Joi.string().hex().length(24).required(),
    }),
    body: Joi.object({
        gst: Joi.string().valid('Yes', 'No').optional(),
        gstNumber: Joi.string()
            .pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
            .optional(),
        gstType: Joi.string().valid('Composition', 'Regular').optional(),
        compositionType: Joi.string().valid('Inclusive', 'Exclusive').optional(),
        cessType: Joi.string().valid('Cess', 'E-cess', 'A-cess').optional(),
        goodsServiceType: Joi.string().valid('CGST', 'SGST', 'IGST').optional(),
        percentage: Joi.number().min(0).max(100).optional(),
    }),
};

const updateFirmDetailsById = {
    params: Joi.object({
        id: Joi.string().hex().length(24).required(),
    }),
    body: Joi.object({
        panNumber: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).optional(),
        aadharNumber: Joi.string().pattern(/^[0-9]{12}$/).optional(),
        panImage: Joi.string().optional(),
        aadharFrontImage: Joi.string().optional(),
        aadharBackImage: Joi.string().optional(),
        firmName: Joi.string().max(255).optional(),
        firmAddress: Joi.string().max(500).optional(),
        firmType: Joi.string().valid('Proprietor', 'Partnership', 'LLP', 'Private Limited').optional(),
        cinNumber: Joi.string().pattern(/^[A-Z0-9]{21}$/).optional(),
    }),
};


const updateBankDetailsById = {
    params: Joi.object({
        id: Joi.string().hex().length(24).required(),
    }),
    body: Joi.object({
        bankName: Joi.string().max(255).optional(), 
        accountNumber: Joi.string().pattern(/^[0-9]{12,16}$/).optional(),
        ifscCode: Joi.string().pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/).optional(), 
        accountHolderName: Joi.string().max(255).optional(),
    }),
};

const updatePartnerDetailsById = {
    params: Joi.object({
        id: Joi.string().hex().length(24).required(),
    }),
    body: Joi.object({
        partners: Joi.array().items(
            Joi.object({
                panNumber: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).optional(),
                panImage: Joi.string().uri().optional(),
                aadharNumber: Joi.string().pattern(/^[0-9]{12}$/).optional(),
                aadharFrontImage: Joi.string().uri().optional(),
                aadharBackImage: Joi.string().uri().optional(),
                document: Joi.array().optional(),
                bankName: Joi.string().optional(),
                accountNumber: Joi.string().optional(),
                ifscCode: Joi.string().optional(),
                accountHolderName: Joi.string().optional(),
            })
        ).optional(),
    }),
};


// Schema for fetching a partner by ID
const getPartnerById = Joi.object({
    id: Joi.string().required(),
});

// Schema for soft deleting a partner by ID
const softDeletePartnerById = Joi.object({
    id: Joi.string().required(),
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
    updatePartnerBasicDetailsById,
    updateGstDetailsById,
    updateFirmDetailsById,
    updateBankDetailsById,
    updatePartnerDetailsById,
    getPartnerById,
    softDeletePartnerById,
    partnerLogin,
    changePassword,
};
