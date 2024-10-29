import { Notification } from '../../models/notification.model.js';
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import { ApiError } from "../../utils/ApiError.js";
import httpStatus from "http-status";
import { queueSMS } from '../../utils/smsQueue.js';
import { User } from '../../models/user.model.js';

// Function to create a new notification
const createNotification = async (data, avatarLocalPath) => {
    const { title, description, userIds, productId, adminId } = data;

    // Check for required fields
    if (!title) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Title is required.");
    }
    if (!description) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Description is required.");
    }

    // Upload the image to Cloudinary
    const image = await uploadOnCloudinary(avatarLocalPath);
    if (!image.url) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error while uploading image");
    }

    // Create notification data
    const notificationData = {
        title,
        description,
        image: image.url,
        userIds,
        productId,
        adminId,
        sentAt: new Date(),
    };

    // Save the new notification to the database
    const newNotification = new Notification(notificationData);
    const savedNotification = await newNotification.save();

    // // Prepare SMS message
    const smsMessage = `${title}\n ${description}`;
    const userPhones = await getUserPhoneNumbers(userIds); // Fetch phone numbers

    // Queue SMS notifications
    userPhones.forEach(phone => {
        if (phone) {
            queueSMS(phone, smsMessage); // Queue SMS for sending
        }
    });

    return savedNotification;
};

// Function to fetch user phone numbers based on user IDs
const getUserPhoneNumbers = async (userIds) => {
    const users = await User.find({ _id: { $in: userIds } }, 'phone');
    return users.map(user => user.phoneNumber).filter(phone => phone);
};

// Function to fetch all notifications
const getAllNotifications = async () => {
    return await Notification.find({});
};

// Function to fetch all active notifications
const getAllActiveNotifications = async () => {
    return await Notification.find({ isDeleted: false }); // Assuming you have an isDeleted field
};

// Function to fetch a notification by ID
const getNotificationById = async (id) => {
    const notification = await Notification.findById(id);
    if (!notification) {
        throw new ApiError(httpStatus.NOT_FOUND, "Notification not found");
    }
    return notification;
};


// Function to update a notification by ID
const updateNotificationById = async (id, data, avatarLocalPath) => {
    const updateData = {};
    
    if (avatarLocalPath) {
        const image = await uploadOnCloudinary(avatarLocalPath);
        updateData.image = image.url;
    }

    // Update fields if they exist in data
    if (data.title) updateData.title = data.title;
    if (data.description) updateData.description = data.description;
    if (data.userIds) updateData.userIds = data.userIds;
    if (data.productId) updateData.productId = data.productId;
    if (data.storeId) updateData.storeId = data.storeId;

    const updatedNotification = await Notification.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedNotification) {
        throw new ApiError(httpStatus.NOT_FOUND, "Notification not found");
    }

    return updatedNotification;
};

// Function to soft delete a notification by ID
const softDeleteNotificationById = async (id) => {
    const notification = await Notification.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!notification) {
        throw new ApiError(httpStatus.NOT_FOUND, "Notification not found");
    }
    return notification;
};

export { 
    createNotification, 
    getAllNotifications, 
    getAllActiveNotifications, 
    getNotificationById, 
    updateNotificationById, 
    softDeleteNotificationById 
};
