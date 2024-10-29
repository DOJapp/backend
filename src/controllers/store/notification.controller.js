import * as NotificationService from '../../services/store/notification.service.js';
import { ApiError } from "../../utils/ApiError.js";
import httpStatus from 'http-status';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from "../../utils/asyncHandler.js";

// Creating a new Notification
const createNotification = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path; // Get the path of the uploaded file

    // Check if the image file exists
    if (!avatarLocalPath) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Image file is missing");
    }

    // Pass both the form data (req.body) and the avatarLocalPath to the service
    const newNotification = await NotificationService.createNotification(req, avatarLocalPath);

    if (!newNotification) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to create Notification");
    }

    return res.status(httpStatus.CREATED).json(
        new ApiResponse(httpStatus.CREATED, newNotification, "Notification created successfully")
    );
});

// Fetching all active Notifications
const getAllNotifications = asyncHandler(async (req, res) => {
    const notifications = await NotificationService.getAllNotifications(); // Changed variable name to plural

    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, notifications, "Notifications fetched successfully")
    );
});
// Fetching all  Notifications By store
const getAllNotificationsByAdmin = asyncHandler(async (req, res) => {
    const notifications = await NotificationService.getAllNotificationsByAdmin(req); // Changed variable name to plural

    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, notifications, "Notifications fetched successfully")
    );
});

// Fetching a single Notification by ID
const getNotificationById = asyncHandler(async (req, res) => {
    const notification = await NotificationService.getNotificationById(req.params.id); // Changed variable name to singular
    if (!notification) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
    }
    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, notification, "Notification fetched successfully")
    );
});

// Updating a Notification by ID
const updateNotificationById = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path; // Get the path of the uploaded file

    const updatedNotification = await NotificationService.updateNotificationById(req.params.id, req.body, avatarLocalPath);

    if (!updatedNotification) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
    }
    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, updatedNotification, "Notification updated successfully")
    );
});

// Soft deleting a Notification by ID
const softDeleteNotificationById = asyncHandler(async (req, res) => {
    const deletedNotification = await NotificationService.softDeleteNotificationById(req.params.id);
    if (!deletedNotification) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
    }
    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, deletedNotification, "Notification deleted successfully")
    );
});

export {
    createNotification,
    getAllNotifications,
    getAllNotificationsByAdmin,
    getNotificationById,
    updateNotificationById,
    softDeleteNotificationById
};
