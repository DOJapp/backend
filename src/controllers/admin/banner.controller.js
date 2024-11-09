import * as BannerService from '../../services/admin/banner.service.js';
import { ApiError } from "../../utils/ApiError.js";
import httpStatus from 'http-status';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from "../../utils/asyncHandler.js";

//  creating a new banner
const createBanner = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;  

    // Check if avatar file exists
    if (!avatarLocalPath) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Image file is missing");
    }

    // Pass both the form data (req.body) and the avatarLocalPath to the service
    const newBanner = await BannerService.createBanner(req.body, avatarLocalPath);

    if (!newBanner) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to create banner");
    }

    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, newBanner, "Banner created successfully")
    );
});


//  fetching all active banners
const getAllBanners = asyncHandler(async (req, res) => {
    const banners = await BannerService.getAllBanners();
    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, banners, "Banners fetched successfully")
    );
});

//  fetching a single banner by ID
const getBannerById = asyncHandler(async (req, res) => {
    const banner = await BannerService.getBannerById(req.params.id);
    if (!banner) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Banner not found');
    }
    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, banner, "Banner fetched successfully")
    );
});

//  updating a banner by ID
const updateBannerById = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;  // Get the path of the uploaded file
 
    const updatedBanner = await BannerService.updateBannerById(req.params.id, req.body, avatarLocalPath);

    if (!updatedBanner) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Banner not found');
    }
    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, updatedBanner, "Banner updated successfully")
    );
});

//  soft deleting a banner by ID
const softDeleteBannerById = asyncHandler(async (req, res) => {
    const deletedBanner = await BannerService.softDeleteBannerById(req.params.id);
    if (!deletedBanner) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Banner not found');
    }
    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, deletedBanner, "Banner deleted successfully")
    );
});

export {
    createBanner,
    getAllBanners,
    getBannerById,
    updateBannerById,
    softDeleteBannerById
};
