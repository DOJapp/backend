import * as CategoryService from '../../services/admin/category.service.js';
import { ApiError } from "../../utils/ApiError.js";
import httpStatus from 'http-status';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from "../../utils/asyncHandler.js";
import { isCacheValid, getCache, setCache, clearCacheByKey } from '../../utils/cache.js'; // Import updated cache utilities

// Creating a new Category
const createCategory = asyncHandler(async (req, res) => {
    const imageLocalPath = req.file?.path; // Get the path of the uploaded file
    if (!imageLocalPath) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Image file is required.");
    }

    const newCategory = await CategoryService.createCategory(req, imageLocalPath);

    if (!newCategory) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to create category.");
    }

    // Clear the categories cache after creating a new category
    clearCacheByKey('categories');

    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, newCategory, "Category created successfully")
    );
});

// Fetching all Categories
const getAllCategories = asyncHandler(async (req, res) => {
    // If not cached, fetch from the service
    const categories = await CategoryService.getAllCategories();
  
    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, categories, "Categories fetched successfully")
    );
});

// Fetching a single Category by ID
const getCategoryById = asyncHandler(async (req, res) => {
    const category = await CategoryService.getCategoryById(req.params.id);
    if (!category) {
        throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
    }
    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, category, "Category fetched successfully")
    );
});

// Updating a Category by ID
const updateCategoryById = asyncHandler(async (req, res) => {
    const imageLocalPath = req.file?.path; // Get the path of the uploaded file

    const updatedCategory = await CategoryService.updateCategoryById(req.params.id, req.body, imageLocalPath);

    if (!updatedCategory) {
        throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
    }

    // Clear the categories cache after updating a category
    clearCacheByKey('categories');

    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, updatedCategory, "Category updated successfully")
    );
});

// Soft deleting a Category by ID
const softDeleteCategoryById = asyncHandler(async (req, res) => {
    const deletedCategory = await CategoryService.softDeleteCategoryById(req.params.id);
    if (!deletedCategory) {
        throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
    }

    // Clear the categories cache after deleting a category
    clearCacheByKey('categories');

    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, deletedCategory, "Category deleted successfully")
    );
});

export {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategoryById,
    softDeleteCategoryById
};
