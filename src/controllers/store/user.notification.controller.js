import * as UserNotificationService from '../../services/store/user.notification.service.js';
import { ApiError } from "../../utils/ApiError.js";
import httpStatus from 'http-status';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from "../../utils/asyncHandler.js";

// Create a new User Notification
const createUserNotification = asyncHandler(async (req, res) => {
    // Create the User Notification
    const newNotification = await UserNotificationService.createUserNotification(req);

    return res.status(httpStatus.CREATED).json(
        new ApiResponse(httpStatus.CREATED, newNotification, "User notification created successfully")
    );
});

// Fetch all active User Notifications
const getAllUserNotifications = asyncHandler(async (req, res) => {
    const notifications = await UserNotificationService.getAllUserNotifications();

    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, notifications, "User notifications fetched successfully")
    );
});

// Fetch a single User Notification by ID
const getUserNotificationById = asyncHandler(async (req, res) => {
    const notification = await UserNotificationService.getUserNotificationById(req.params.id);

    if (!notification) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User notification not found');
    }

    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, notification, "User notification fetched successfully")
    );
});

// Update a User Notification by ID
const updateUserNotificationById = asyncHandler(async (req, res) => {
    const updatedNotification = await UserNotificationService.updateUserNotificationById(req.params.id, req.body);

    if (!updatedNotification) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User notification not found');
    }

    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, updatedNotification, "User notification updated successfully")
    );
});

// Soft delete a User Notification by ID (logical deletion)
const softDeleteUserNotificationById = asyncHandler(async (req, res) => {
    const deletedNotification = await UserNotificationService.softDeleteUserNotificationById(req.params.id);

    if (!deletedNotification) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User notification not found');
    }

    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, deletedNotification, "User notification deleted successfully")
    );
});


const importUserNotification = asyncHandler(async (req, res) => {
    const adminId = req.admin._id;
    const filePath = req.file?.path; // Get the path of the uploaded file (if any)

    // Check if the file exists
    if (!filePath) {
        throw new ApiError(httpStatus.BAD_REQUEST, "File is missing");
    }

    // try {
        // Call the service function to import user notifications
        const response = await UserNotificationService.importUserNotification(adminId, filePath);
        return res.status(httpStatus.OK).json(
            new ApiResponse(httpStatus.OK, response, "User notifications imported successfully")
        );
    // } catch (error) {
    //     throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
    // }
});


export {
    createUserNotification,
    getAllUserNotifications,
    getUserNotificationById,
    updateUserNotificationById,
    softDeleteUserNotificationById,
    importUserNotification
};
