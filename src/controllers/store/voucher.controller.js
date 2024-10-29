import * as VoucherService from '../../services/admin/voucher.service.js';
import { ApiError } from "../../utils/ApiError.js";
import httpStatus from 'http-status';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from "../../utils/asyncHandler.js";

// Creating a new Voucher
const createVoucher = asyncHandler(async (req, res) => {
    const adminId = req.admin._id;
    const result = await VoucherService.create(adminId, req.body);

    if (!result) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to create voucher.");
    }

    return res.status(httpStatus.CREATED).json(
        new ApiResponse(httpStatus.CREATED, result, "Voucher created successfully.")
    );
});

// Fetching all Vouchers
const getAllVouchers = asyncHandler(async (req, res) => {
    const adminId = req.admin._id;

    const vouchers = await VoucherService.getAllVouchers(adminId);

    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, vouchers, "Vouchers fetched successfully.")
    );
});


// Fetching a single Voucher by ID
const getVoucherById = asyncHandler(async (req, res) => {
    const result = await VoucherService.getById(req.params.id);
    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, "Voucher not found.");
    }
    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, result, "Voucher fetched successfully.")
    );
});


// Updating a Voucher by ID
const updateVoucherById = asyncHandler(async (req, res) => {
    const updated = await VoucherService.updateById(req.params.id, req.body);

    if (!updated) {
        throw new ApiError(httpStatus.NOT_FOUND, "Voucher not found.");
    }

    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, updated, "Voucher updated successfully.")
    );
});


// Updating the expiry date of a Voucher
const updateVoucherExpiryDate = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { expiryDate } = req.body;

    const updated = await VoucherService.updateExpiryById(id, expiryDate);

    if (!updated) {
        throw new ApiError(httpStatus.NOT_FOUND, "Voucher not found.");
    }

    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, updated, "Voucher expiry date updated successfully.")
    );
});

// Soft deleting a Voucher by ID
const softDeleteVoucherById = asyncHandler(async (req, res) => {
    const deleted = await VoucherService.softDeleteById(req.params.id);
    if (!deleted) {
        throw new ApiError(httpStatus.NOT_FOUND, "Voucher not found.");
    }

    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, deleted, "Voucher deleted successfully.")
    );
});

export {
    createVoucher,
    getAllVouchers,
    getVoucherById,
    updateVoucherById,
    updateVoucherExpiryDate,
    softDeleteVoucherById
};
