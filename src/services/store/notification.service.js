import { Notification } from '../../models/notification.model.js'; // Corrected model import
import { uploadOnCloudinary } from "../../utils/cloudinary.js"; // Assuming you have a utility for Cloudinary
import { ApiError } from "../../utils/ApiError.js";
import httpStatus from "http-status";

// Function to create a new notification
const createNotification = async (req, avatarLocalPath) => {
    const { title, description, userIds, productId } = req.body;
    const adminId = req?.admin?._id;
    // Check for required fields
    if (!title) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Title is required .");
    }
    if (!description) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Description is required.");
    }

    // Upload the image to Cloudinary using the local file path
    const image = await uploadOnCloudinary(avatarLocalPath);

    // Check if the Cloudinary upload was successful
    if (!image.url) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error while uploading image");
    }

    // Create notification data
    const notificationData = {
        title,
        description,
        image: image.url,
        userIds, // Assuming this is an array of user IDs
        productId,
        adminId,
        sentAt: new Date(), // Set sentAt to the current date
    };

    // Create a new notification using the processed data
    const newNotification = new Notification(notificationData);

    // Save the new notification to the database
    return await newNotification.save();
};

// Function to fetch all notifications (excluding deleted)
const getAllNotifications = async () => {
    return await Notification.find({});
};

// Function to fetch all notifications By store Admin (excluding deleted)
const getAllNotificationsByAdmin = async (req) => {
    const adminId = req?.admin?._id;
    return await Notification.find({ adminId: adminId });
};

// Function to fetch all active notifications (excluding deleted)
const getAllActiveNotifications = async () => {
    return await Notification.find({}); // Fetch active notifications that are not marked as deleted
};

// Function to fetch a notification by ID (excluding deleted)
const getNotificationById = async (id) => {
    const notification = await Notification.findById(id);
    if (!notification) {
        throw new ApiError(httpStatus.NOT_FOUND, "Notification not found");
    }
    return notification; // Return found notification
};

// Function to update a notification by ID
const updateNotificationById = async (id, data, avatarLocalPath) => {
    const updateData = {}; // Initialize an empty object for the fields to be updated

    // Check if avatarLocalPath exists, then upload the new image and update image
    if (avatarLocalPath) {
        const image = await uploadOnCloudinary(avatarLocalPath);
        // Add the new image URL to the updateData
        updateData.image = image.url;
    }

    // Update title, description, userIds, productId, storeId as needed
    if (data.title) {
        updateData.title = data.title;
    }
    if (data.description) {
        updateData.description = data.description;
    }
    if (data.userIds) {
        updateData.userIds = data.userIds; // Ensure userIds is an array
    }
    if (data.productId) {
        updateData.productId = data.productId;
    }
    if (data.storeId) {
        updateData.storeId = data.storeId;
    }

    // Update the notification with the new data
    const updatedNotification = await Notification.findByIdAndUpdate(id, updateData, { new: true });

    // Check if the notification exists and was updated
    if (!updatedNotification) {
        throw new ApiError(httpStatus.NOT_FOUND, "Notification not found");
    }

    return updatedNotification; // Returns the updated document
};

// Function to soft delete a notification by ID
const softDeleteNotificationById = async (id) => {
    const notification = await Notification.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!notification) {
        throw new ApiError(httpStatus.NOT_FOUND, "Notification not found");
    }
    return notification; // Returns the deleted notification
};

export { createNotification, getAllNotifications, getAllNotificationsByAdmin, getAllActiveNotifications, getNotificationById, updateNotificationById, softDeleteNotificationById };
