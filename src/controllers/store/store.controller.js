import * as StoreService from '../../services/store/store.service.js';
import { ApiError } from "../../utils/ApiError.js";
import httpStatus from 'http-status';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from "../../utils/asyncHandler.js";


// Fetch a single Store by ID
const getStoreById = asyncHandler(async (req, res) => {
    const result = await StoreService.getStoreById(req.params.id);

    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Store not found');
    }

    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, result, "Store fetched successfully")
    );
});



// Store login - generates OTP
const storeLogin = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Generate OTP and get user info
    const response = await StoreService.storeLogin(email, password);

    // Send OTP response
    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, response, "Login successfully")
    );

});

// Store logout - invalidates refresh token
const storeLogout = asyncHandler(async (req, res) => {
    const adminId = req.admin.id; // Assuming `req.user` contains the authenticated Store's ID

    // Call the Store Logout service function
    const response = await StoreService.storeLogout(adminId);

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
        return res.status(httpStatus.BAD_REQUEST).json(
            new ApiResponse(httpStatus.BAD_REQUEST, null, 'Current and new password are required')
        );
    }

    // Call the changePassword function
    const response = await StoreService.changePassword(adminId, currentPassword, newPassword);

    // Send success response
    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, response, 'Password changed successfully')
    );
});

const updateAddress = asyncHandler(async (req, res) => {
    const storeId = req.params.id;

    const updatedAddress = await StoreService.updateAddress(storeId, req.body);
    if (!updatedAddress) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Store not found');
    }

    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, updatedAddress, "Store Address updated successfully")
    );

});


// 
const updateOpeningHours = asyncHandler(async (req, res) => {
    const storeId = req.params.id;

    const updatedAddress = await StoreService.updateOpeningHours(storeId, req.body);
    if (!updatedAddress) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Store not found');
    }

    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, updatedAddress, "Store Address updated successfully")
    );

});

export {
    getStoreById,
    storeLogin,
    storeLogout,
    changePassword,
    updateAddress,
    updateOpeningHours
};
