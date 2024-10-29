import { UserNotifications } from '../../models/user.notification.model.js'; // Ensure correct model import
import { ApiError } from "../../utils/ApiError.js";
import httpStatus from "http-status";
import fs from 'fs';
import csv from 'csv-parser'; // Make sure to install this
import xlsx from 'xlsx';

// Function to create a new User Notification
const createUserNotification = async (req) => {
    const { name, phone, email } = req.body;
    const adminId = req.admin?._id; // Use optional chaining for safety

    // Check if required fields are provided
    if (!name || !phone || !email) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Name, phone, and email are required.");
    }

    const userNotificationData = {
        name,
        phone,
        email,
        adminId,
    };

    // Create a new User Notification
    const newUserNotification = new UserNotifications(userNotificationData);

    // Save the new User Notification to the database
    return await newUserNotification.save();
};

// Function to fetch all User Notifications (excluding deleted)
const getAllUserNotifications = async () => {
    return await UserNotifications.find({ isDeleted: false });
};

// Function to fetch a User Notification by ID (excluding deleted)
const getUserNotificationById = async (id) => {
    const notification = await UserNotifications.findById(id);

    // Check if Notification exists
    if (!notification) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User notification not found');
    }

    return notification;
};

// Function to update a User Notification by ID
const updateUserNotificationById = async (id, data) => {
    const updateData = {}; // Initialize an empty object for the fields to be updated

    // Update the fields if they are provided in the request data
    if (data.name) updateData.name = data.name;
    if (data.phone) updateData.phone = data.phone;
    if (data.email) updateData.email = data.email;

    // Update the User Notification with the new data
    const updatedNotification = await UserNotifications.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    // Check if the Notification exists and was updated
    if (!updatedNotification) {
        throw new ApiError(httpStatus.NOT_FOUND, "User notification not found");
    }

    return updatedNotification; // Return the updated document
};

// Function to soft delete a User Notification by ID
const softDeleteUserNotificationById = async (id) => {
    const deletedNotification = await UserNotifications.findByIdAndUpdate(id, { isDeleted: true }, { new: true });

    // Check if the Notification exists and was marked as deleted
    if (!deletedNotification) {
        throw new ApiError(httpStatus.NOT_FOUND, "User notification not found");
    }

    return deletedNotification; // Return the deleted notification
};

const importUserNotification = async (adminId, filePath) => {
    const notifications = [];

    // Determine file type
    const ext = filePath.split('.').pop().toLowerCase();

    // Parse CSV file
    if (ext === 'csv') {
        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => {
                    // Convert keys to lowercase
                    const formattedData = {};
                    Object.keys(data).forEach(key => {
                        formattedData[key.toLowerCase()] = data[key];
                    });

                    // Add adminId to each notification
                    notifications.push({ ...formattedData, adminId });
                })
                .on('end', async () => {
                    try {
                        const savedNotifications = await UserNotifications.insertMany(notifications);
                        resolve(savedNotifications);
                    } catch (error) {
                        reject(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to save notifications'));
                    }
                })
                .on('error', (error) => {
                    reject(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error reading CSV file'));
                });
        });
    }

    // Parse Excel file
    if (ext === 'xlsx') {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        // Convert column names to lowercase
        const formattedData = data.map(item => {
            const newItem = {};
            Object.keys(item).forEach(key => {
                newItem[key.toLowerCase()] = item[key];
            });
            return newItem;
        });


        // Add adminId to each notification
        formattedData.forEach(item => notifications.push({ ...item, adminId }));

        try {
            const savedNotifications = await UserNotifications.insertMany(notifications);
            return savedNotifications;
        } catch (error) {
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to save notifications');
        }
    }


    throw new ApiError(httpStatus.BAD_REQUEST, 'Unsupported file type');
};

export {
    createUserNotification,
    getAllUserNotifications,
    getUserNotificationById,
    updateUserNotificationById,
    softDeleteUserNotificationById,
    importUserNotification
};
