import { Coupon } from '../../models/coupon.model.js';
import { ApiError } from "../../utils/ApiError.js";
import httpStatus from "http-status";

// Function to create a new Coupon
const create = async (adminId, data) => {

    const { title, description, status, discountType, usagePerUser, minOrderValue, discountValue, expiryDate } = data;

    // Prepare Coupon data according to the schema
    const couponData = {
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

    // Create and save the new Coupon
    const newCoupon = new Coupon(couponData);

    // Save the Coupon to the database
    return await newCoupon.save();
};

// Function to fetch all Coupons
const getAllCoupon = async (adminId) => {
    return await Coupon.find({ adminId: adminId });
};

// Function to fetch all Active Coupons
const getAllActiveCoupon = async () => {
    return await Coupon.find({ status: "Active" });
};

// Function to fetch a Coupon by ID
const getById = async (id) => {
    const coupon = await Coupon.findById(id);
    if (!coupon) {
        throw new ApiError(httpStatus.NOT_FOUND, "Coupon not found");
    }
    return coupon;
};

// Function to update a Coupon by ID
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

    const updatedCoupon = await Coupon.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedCoupon) {
        throw new ApiError(httpStatus.NOT_FOUND, "Coupon not found");
    }

    return updatedCoupon;
};

// Function to update the expiry date of a Coupon by ID
const updateExpiaryById = async (id, expiryDate) => {
    const updateData = { expiryDate };

    const updatedCoupon = await Coupon.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!updatedCoupon) {
        throw new ApiError(httpStatus.NOT_FOUND, "Coupon not found");
    }

    return updatedCoupon;
};

// Function to soft delete a Coupon by ID
const softDeleteById = async (id) => {
    const deletedCoupon = await Coupon.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!deletedCoupon) {
        throw new ApiError(httpStatus.NOT_FOUND, "Coupon not found");
    }
    return deletedCoupon;
};

export {
    create,
    getAllCoupon,
    getAllActiveCoupon,
    getById,
    updateById,
    updateExpiaryById,
    softDeleteById
};
