import { Voucher } from '../../models/voucher.model.js';
import { ApiError } from "../../utils/ApiError.js";
import httpStatus from "http-status";

// Function to create a new Voucher
const create = async (adminId, data) => {
    const { title, description, status, discountType, usagePerUser, minOrderValue, discountValue, expiryDate } = data;

    // Prepare Voucher data according to the schema
    const voucherData = {
        title,
        description,
        adminId,
        status,
        discountType,
        usagePerUser,
        minOrderValue,
        discountValue,
        expiryDate
    };

    // Create and save the new Voucher
    const newVoucher = new Voucher(voucherData);

    // Save the Voucher to the database
    return await newVoucher.save();
};

// Function to fetch all Vouchers
const getAllVouchers = async () => {
    return await Voucher.find({ adminId: adminId });
};

// Function to fetch all Active Vouchers
const getAllActiveVouchers = async () => {
    return await Voucher.find({ status: "Active" });
};

// Function to fetch a Voucher by ID
const getById = async (id) => {
    const voucher = await Voucher.findById(id);
    if (!voucher) {
        throw new ApiError(httpStatus.NOT_FOUND, "Voucher not found");
    }
    return voucher;
};

// Function to update a Voucher by ID
const updateById = async (id, data) => {
    const { title, description, status, discountType, usagePerUser, minOrderValue, discountValue, expiryDate } = data;

    const updateData = {};

    // Add provided fields to updateData
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (discountType !== undefined) updateData.discountType = discountType;
    if (usagePerUser !== undefined) updateData.usagePerUser = usagePerUser;
    if (minOrderValue !== undefined) updateData.minOrderValue = minOrderValue;
    if (discountValue !== undefined) updateData.discountValue = discountValue;
    if (expiryDate !== undefined) updateData.expiryDate = expiryDate;

    const updatedVoucher = await Voucher.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedVoucher) {
        throw new ApiError(httpStatus.NOT_FOUND, "Voucher not found");
    }

    return updatedVoucher;
};

// Function to update the expiry date of a Voucher by ID
const updateExpiryById = async (id, expiryDate) => {
    const updateData = { expiryDate };

    const updatedVoucher = await Voucher.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!updatedVoucher) {
        throw new ApiError(httpStatus.NOT_FOUND, "Voucher not found");
    }

    return updatedVoucher;
};

// Function to soft delete a Voucher by ID
const softDeleteById = async (id) => {
    const deletedVoucher = await Voucher.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!deletedVoucher) {
        throw new ApiError(httpStatus.NOT_FOUND, "Voucher not found");
    }
    return deletedVoucher;
};

export {
    create,
    getAllVouchers,
    getAllActiveVouchers,
    getById,
    updateById,
    updateExpiryById,
    softDeleteById
};
