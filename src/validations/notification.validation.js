import Joi from 'joi';

// Validation schema for fetching a Notification by ID
const getNotificationById = {
    params: Joi.object().keys({
        id: Joi.string().hex().length(24).required(),
    }),
};

const createNotification = {
    body: Joi.object().keys({
        title: Joi.string().required(), // Required field
        description: Joi.string().required(), // Required field
        userId: Joi.string().optional().hex().length(24), // Optional and must be a valid ObjectId
        productId: Joi.string().optional().hex().length(24), // Optional and must be a valid ObjectId
        storeId: Joi.string().optional().hex().length(24), // Optional and must be a valid ObjectId
        image: Joi.string().optional(), // Optional field for image URL
    }),
};

// Validation schema for updating a Notification by ID
const updateNotificationById = {
    params: Joi.object().keys({
        id: Joi.string().hex().length(24).required(),
    }),
    body: Joi.object().keys({
        title: Joi.string().required(), // Optional field
        description: Joi.string().required(), // Optional field
        userId: Joi.string().optional().hex().length(24), // Optional and must be a valid ObjectId
        productId: Joi.string().optional().hex().length(24), // Optional and must be a valid ObjectId
        storeId: Joi.string().optional().hex().length(24), // Optional and must be a valid ObjectId
    }),
};

// Validation schema for soft deleting a Notification by ID
const softDeleteNotificationById = {
    params: Joi.object().keys({
        id: Joi.string().hex().length(24).required(),
    }),
};

export {
    getNotificationById,
    createNotification,
    updateNotificationById,
    softDeleteNotificationById,
};
