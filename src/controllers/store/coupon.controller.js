import * as CouponsService from '../../services/store/coupon.service.js';
import { ApiError } from "../../utils/ApiError.js";
import httpStatus from 'http-status';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from "../../utils/asyncHandler.js";

// Creating a new Coupon
const createCoupons = asyncHandler(async (req, res) => {
    const adminId = req.admin._id;
    const result = await CouponsService.create(adminId, req.body);

    if (!result) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to create Coupon.");
    }

    return res.status(httpStatus.CREATED).json(
        new ApiResponse(httpStatus.CREATED, result, "Coupon created successfully.")
    );
});

// Fetching all Coupons
const getAllCoupons = asyncHandler(async (req, res) => {
    const adminId = req.admin._id;
    const coupons = await CouponsService.getAllCoupon(adminId);

    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, coupons, "Coupons fetched successfully.")
    );
});

// Fetching a single Coupon by ID
const getById = asyncHandler(async (req, res) => {
    const result = await CouponsService.getById(req.params.id);
    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, "Coupon not found.");
    }
    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, result, "Coupon fetched successfully.")
    );
});

// Updating a Coupon by ID
const updateById = asyncHandler(async (req, res) => {
    const updated = await CouponsService.updateById(req.params.id, req.body);

    if (!updated) {
        throw new ApiError(httpStatus.NOT_FOUND, "Coupon not found.");
    }

    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, updated, "Coupon updated successfully.")
    );
});


// Updating the expiry date of a Coupon
const updateExpiryDate = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { expiryDate } = req.body;

    const updated = await CouponsService.updateExpiaryById(id, expiryDate);

    if (!updated) {
        throw new ApiError(httpStatus.NOT_FOUND, "Coupon not found.");
    }

    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, updated, "Coupon expiry date updated successfully.")
    );
});


// Soft deleting a Coupon by ID
const softDeleteById = asyncHandler(async (req, res) => {
    const deleted = await CouponsService.softDeleteById(req.params.id);
    if (!deleted) {
        throw new ApiError(httpStatus.NOT_FOUND, "Coupon not found.");
    }

    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, deleted, "Coupon deleted successfully.")
    );
});


export {
    createCoupons,
    getAllCoupons,
    getById,
    updateById,
    updateExpiryDate,
    softDeleteById
};
