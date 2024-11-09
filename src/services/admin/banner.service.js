import { Banners } from '../../models/banner.model.js';
import { uploadOnCloudinary } from "../../utils/cloudinary.js"; // Assuming you have a utility for Cloudinary
import { ApiError } from "../../utils/ApiError.js";
import httpStatus from "http-status";

// Function to create a new banner
const createBanner = async (data, avatarLocalPath) => {
    const { status, redirectTo, storeId, productId } = data;
    if (!status) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Missing status in request body");
    }
    // Upload the avatar to Cloudinary using the local file path
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    // Check if the Cloudinary upload was successful
    if (!avatar.url) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error while uploading avatar");
    }

    // Add the Cloudinary URL to the banner data
    const bannerData = {
        status,
        redirectTo,
        storeId,
        productId,
        image: avatar.url,  // Assuming you're storing the avatar URL in the banner
    };

    // Create a new banner using the processed data
    const newBanner = new Banners(bannerData);

    // Save the new banner to the database
    return await newBanner.save();
};

// Function to fetch all active banners (excluding deleted)
const getAllBanners = async () => {
    return await Banners.find().populate("productId").populate("storeId").sort({ createdAt: -1 });
};

// Function to fetch all active banners (excluding deleted or Blocked)
const getAllActiveBanners = async () => {
    return await Banners.find({ status: "Active" }).sort({ createdAt: -1 }); // Middleware filters deleted banners
};

// Function to fetch a banner by ID (excluding deleted)
const getBannerById = async (id) => {
    return await Banners.findById(id); // Middleware filters deleted banners

};

// Function to update a banner by ID
const updateBannerById = async (id, data, avatarLocalPath) => {
    const updateData = {}; // Initialize an empty object for the fields to be updated

    // Check if avatarLocalPath exists, then upload the new image and update avatarUrl
    if (avatarLocalPath) {
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        // Add the new avatar URL to the updateData
        updateData.image = avatar.url;
    }
    // Check if status exists in data, then update status
    if (data.status) {
        updateData.status = data.status;
    }


    // Update the banner with the new data
    const updatedBanner = await Banners.findByIdAndUpdate(id, updateData, { new: true });

    // Check if the banner exists and was updated
    if (!updatedBanner) {
        throw new ApiError(httpStatus.NOT_FOUND, "Banner not found");
    }

    return updatedBanner; // Returns the updated document
};


// Function to soft delete a banner
const softDeleteBannerById = async (id) => {
    return await Banners.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
};


export { createBanner, getAllBanners, getAllActiveBanners, getBannerById, updateBannerById, softDeleteBannerById };