import * as StoreService from '../../services/admin/store.service.js';
import { ApiError } from "../../utils/ApiError.js";
import httpStatus from 'http-status';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from "../../utils/asyncHandler.js";

// Create a new Store
const createStore = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.files?.avatar[0]?.path;
    if (!avatarLocalPath) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Avatar file is required");
    }

    const imageLocalPath = req.files?.image[0]?.path;
    if (!imageLocalPath) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Image file is required");
    }

    // Create the Store with form data and images
    const result = await StoreService.createStore(req, avatarLocalPath, imageLocalPath);

    return res.status(httpStatus.CREATED).json(
        new ApiResponse(httpStatus.CREATED, result, "Store created successfully")
    );
});

// Fetch all active Stores
const getAllStores = asyncHandler(async (req, res) => {
    const stores = await StoreService.getAllStores();

    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, stores, "Stores fetched successfully")
    );
});

// Fetch a single Store by ID
const getStoreById = asyncHandler(async (req, res) => {
    const store = await StoreService.getStoreById(req.params.id);

    if (!store) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Store not found');
    }

    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, store, "Store fetched successfully")
    );
});

// Update a Store by ID
const updateStoreById = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path; // Get the path of the uploaded file (if any)

    // Merge the update data, including the image if provided
    const updatedStore = await StoreService.updateStoreById(req.params.id, {
        ...req.body,
        avatar: avatarLocalPath || req.body.avatar // Update avatar if a new image is provided
    });

    if (!updatedStore) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Store not found');
    }

    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, updatedStore, "Store updated successfully")
    );
});

// Soft delete a Store by ID (logical deletion)
const softDeleteStoreById = asyncHandler(async (req, res) => {
    const deletedStore = await StoreService.softDeleteStoreById(req.params.id);

    if (!deletedStore) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Store not found');
    }

    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, deletedStore, "Store deleted successfully")
    );
});

// Store login - generates OTP
const storeLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Generate OTP and get user info
    const response = await StoreService.storeLogin(email, password);

    // Send OTP response
    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, response, "Login successful")
    );
});

// Store logout - invalidates refresh token
const storeLogout = asyncHandler(async (req, res) => {
    const adminId = req.admin.id; // Assuming `req.admin` contains the authenticated Store's ID

    // Call the storeLogout service function
    await StoreService.storeLogout(adminId);

    // Send the response back to the client
    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, {}, "Logout successful")
    );
});

// Store password change 
const changePassword = asyncHandler(async (req, res) => {
    const adminId = req.admin.id;
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Current and new password are required');
    }

    // Call the changePassword function
    const response = await StoreService.changePassword(adminId, currentPassword, newPassword);

    // Send success response
    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, response, 'Password changed successfully')
    );
});

// Update Store address
const updateAddress = asyncHandler(async (req, res) => {
    const storeId = req.params.id;

    const updatedAddress = await StoreService.updateAddress(storeId, req.body);
    if (!updatedAddress) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Store not found');
    }

    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, updatedAddress, "Store address updated successfully")
    );
});

// Update Store opening hours
const updateOpeningHours = asyncHandler(async (req, res) => {
    const storeId = req.params.id;

    const updatedOpeningHours = await StoreService.updateOpeningHours(storeId, req.body);
    if (!updatedOpeningHours) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Store not found');
    }

    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, updatedOpeningHours, "Store opening hours updated successfully")
    );
});

export {
    createStore,
    getAllStores,
    getStoreById,
    updateStoreById,
    softDeleteStoreById,
    storeLogin,
    storeLogout,
    changePassword,
    updateAddress,
    updateOpeningHours
};
