import { Store } from '../../models/store.model.js';
import { Admin } from '../../models/admin.model.js';
import { uploadOnCloudinary } from '../../utils/cloudinary.js';
import { ApiError } from '../../utils/ApiError.js';
import httpStatus from 'http-status';
import bcrypt from "bcrypt";

import { generateAdminAccessAndRefreshTokens } from "../../utils/tokenUtils.js";

// Helper function to check for email or phone uniqueness
const checkUniqueFields = async (email, phone, excludeId = null) => {
    const emailExists = await Admin.findOne({ email, _id: { $ne: excludeId } });
    if (emailExists) {
        throw new ApiError(httpStatus.CONFLICT, 'Email is already taken');
    }
    const phoneExists = await Admin.findOne({ phone, _id: { $ne: excludeId } });
    if (phoneExists) {
        throw new ApiError(httpStatus.CONFLICT, 'Phone number is already taken');
    }
};

// Function to create a new Store
const createStore = async (req, avatarLocalPath, imageLocalPath) => {
    const { name, email, password, phone, title, categoryId, tagId, address, city, state, zipCode, coordinates, status } = req.body; // Destructure location
    const addedBy = req?.user?._id;

    // Check if email or phone already exists
    await checkUniqueFields(email, phone);

    // Upload the avatar to Cloudinary using the local file path
    const avatar = avatarLocalPath ? await uploadOnCloudinary(avatarLocalPath) : null;

    // Upload the Store image to Cloudinary using the local file path
    const image = imageLocalPath ? await uploadOnCloudinary(imageLocalPath) : null;

    // Check if the Cloudinary upload was successful if an image was provided
    if (avatarLocalPath && !avatar?.url) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error while uploading avatar');
    }

    // Prepare Admin data with Cloudinary URL if available
    const adminData = {
        name,
        email,
        password,
        phone,
        role: "Store",
        avatar: avatar?.url || '', // Use the uploaded avatar or default
        addedBy,
    };

    // Create a new Admin using the processed data
    const newAdmin = new Admin(adminData);

    try {
        // Save the new Admin to the database
        const savedAdmin = await newAdmin.save();

        // If admin is saved successfully, create the store
        const storeData = {
            title,
            categoryId,
            tagId,
            address,
            city,
            state,
            zipCode,
            coordinates,
            status,
            image: image?.url || '',
            adminId: savedAdmin._id
        };

        const newStore = new Store(storeData);
        const savedStore = await newStore.save();

        const populatedStore = await Store.findById(savedStore._id).populate('adminId');
        return populatedStore;
    } catch (error) {
        // If an error occurs, delete the admin if it was created
        if (newAdmin._id) {
            await Admin.findByIdAndDelete(newAdmin._id);
        }
        // Rethrow the error for further handling
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
};

// Function to fetch all Stores (excluding deleted)
const getAllStores = async () => {
    return await Store.find().populate('adminId').sort({ createdAt: -1 }); // Middleware automatically filters deleted Stores
};

// Function to fetch all active Stores (excluding deleted or blocked)
const getAllActiveStores = async () => {
    return await Store.find({ status: 'Active' }).populate('adminId'); // Fetch only active Stores, excluding deleted
};

// Function to fetch a Store by ID (excluding deleted)
const getStoreById = async (id) => {
    const store = await Store.findById(id).populate('adminId'); // Populate store details if applicable

    // Check if Store exists
    if (!store) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Store not found');
    }

    return store;
};

// Function to update a Store by ID
const updateStoreById = async (id, data, avatarLocalPath) => {
    const { name, email, phone, role, fcmToken } = data;

    // Check if email or phone already exists (excluding current Store)
    await checkUniqueFields(email, phone, id);

    const updateData = {}; // Initialize an empty object for the fields to be updated

    // Check if avatarLocalPath exists, then upload the new image and update the image URL
    if (avatarLocalPath) {
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        if (avatar?.url) {
            updateData.avatar = avatar.url; // Add the new avatar URL to updateData
        } else {
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error while uploading avatar');
        }
    }

    // Update all other fields if they are provided in the request data
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (role) updateData.role = role;
    if (fcmToken) updateData.fcmToken = fcmToken;

    // Update the Store with the new data
    const updatedStore = await Store.findByIdAndUpdate(id, updateData, { new: true });

    // Check if the Store exists and was updated
    if (!updatedStore) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Store not found');
    }

    return updatedStore; // Return the updated document
};

// Function to soft delete a Store by ID
const softDeleteStoreById = async (id) => {
    // Find the store by ID
    const store = await Store.findById(id);

    // Check if the Store was found and is already soft deleted
    if (!store) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Store not found');
    }

    if (store.isDeleted) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Store is already deleted');
    }

    // Soft delete the Store
    store.isDeleted = true;
    await store.save();

    // Soft delete the corresponding Admin as well
    const adminId = store.adminId; // Get the associated Admin ID
    const admin = await Admin.findById(adminId); // Find the Admin by ID

    if (admin) { // Check if the Admin exists
        admin.isDeleted = true; // Soft delete the Admin
        await admin.save(); // Save the changes
    }

    return store; // Return the soft deleted store
};

const storeLogin = async (email, password) => {
    // Find the Store by email
    const store = await Admin.findOne({ email });

    // Check if the Store exists
    if (!store) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
    }

    // Verify the password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, store.password);
    if (!isPasswordValid) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
    }

    // Generate access and refresh tokens for the authenticated Store
    const { accessToken, refreshToken } = await generateAdminAccessAndRefreshTokens(store._id);

    const storeData = await Store.find({ adminId: store._id }).select("-password -refreshToken").populate('adminId');

    return {
        storeData,
        accessToken,
        refreshToken
    };
};

const storeChangePassword = async (storeId, oldPassword, newPassword) => {
    // Find the Store by ID
    const store = await Store.findById(storeId);

    // Check if the Store exists
    if (!store) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Store not found');
    }

    // Verify the old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, store.password);
    if (!isOldPasswordValid) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Old password is incorrect');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the Store's password
    store.password = hashedPassword;
    await store.save();

    return { message: 'Password updated successfully' };
};

const storeLogout = async (storeId) => {
    // Find the Store by ID
    const admin = await Admin.findById(storeId);

    // Check if the Store exists
    if (!admin) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Store not found');
    }

    // Invalidate the refresh token by removing it from the database (or setting it to null)
    admin.refreshToken = null;
    await admin.save();

    return { message: 'Logged out successfully' };
};

const changePassword = async (adminId, currentPassword, newPassword) => {
    const admin = await Admin.findById(adminId);
    // Check if the admin exists
    if (!admin || admin.isDeleted) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found');
    }

    // Check if the current password is correct using the schema method
    const isPasswordValid = await admin.isPasswordCorrect(currentPassword);
    if (!isPasswordValid) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Current password is incorrect');
    }

    // Update the admin's password with the new password
    admin.password = newPassword;  // The pre-save hook will handle hashing
    await admin.save();

    return admin;
};

const updateAddress = async (id, data) => {
    // Check if the Admin exists
    // Find the Store associated with the Admin ID
    const store = await Store.findById(id);
    if (!store) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Store not found');
    }

    // Update the Store's address details
    store.address = data.address || store.address;
    store.city = data.city || store.city;
    store.state = data.state || store.state;
    store.zipCode = data.zipCode || store.zipCode;
    store.coordinates = data.coordinates || store.coordinates;

    // Save the updated Store document
    await store.save();

    return store;
};

const updateOpeningHours = async (id, data) => {
    const { openingHours } = data;
    // Find the Store associated with the Admin ID
    const store = await Store.findById(id);
    if (!store) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Store not found');
    }

    // Update the Store's openingHours
    store.openingHours = openingHours;

    // Save the updated Store document
    await store.save();

    return store;
};

// Additional Store-specific functions can be added here... 
export {
    createStore,
    getAllStores,
    getAllActiveStores,
    getStoreById,
    updateStoreById,
    softDeleteStoreById,
    storeLogin,
    storeLogout,
    storeChangePassword,
    changePassword,
    updateAddress,
    updateOpeningHours
};
