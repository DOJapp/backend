import * as ProductService from '../../services/admin/product.service.js';
import { ApiError } from "../../utils/ApiError.js";
import httpStatus from 'http-status';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from "../../utils/asyncHandler.js";
import { clearCacheByKey } from '../../utils/cache.js';

// Create a new product
const createProduct = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path; // Get the path of the uploaded file (if any)

    // Check if the image file exists
    if (!avatarLocalPath) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Image file is missing");
    }

    // Create the product with form data and image
    const newProduct = await ProductService.createProduct(req, avatarLocalPath); // Make sure to pass req.body

    // Clear the product cache after creating a new product
    clearCacheByKey('products'); // Use cache utility to clear cache

    return res.status(httpStatus.CREATED).json(
        new ApiResponse(httpStatus.CREATED, newProduct, "Product created successfully")
    );
});

// Fetch all  products
const getAllProducts = asyncHandler(async (req, res) => {
    const products = await ProductService.getAllProducts();

    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, products, "Products fetched successfully")
    );
});
// Fetch all active products
const getAllActiveProducts = asyncHandler(async (req, res) => {
    const products = await ProductService.getAllActiveProducts();

    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, products, "Products fetched successfully")
    );
});

// Fetch a single product by ID
const getProductById = asyncHandler(async (req, res) => {
    const product = await ProductService.getProductById(req.params.id);

    if (!product) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
    }

    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, product, "Product fetched successfully")
    );
});

// Update a product by ID
const updateProductById = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path; // Get the path of the uploaded file (if any)

    // Update the product with form data and image (if provided)
    const updatedProduct = await ProductService.updateProductById(req.params.id, req.body, avatarLocalPath);

    if (!updatedProduct) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
    }

    // Clear the product cache after updating a product
    clearCacheByKey('products'); // Use cache utility to clear cache

    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, updatedProduct, "Product updated successfully")
    );
});

// Soft delete a product by ID (logical deletion)
const softDeleteProductById = asyncHandler(async (req, res) => {
    const deletedProduct = await ProductService.softDeleteProductById(req.params.id);

    if (!deletedProduct) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
    }

    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, deletedProduct, "Product deleted successfully")
    );
});

export {
    createProduct,
    getAllProducts,
    getAllActiveProducts,
    getProductById,
    updateProductById,
    softDeleteProductById
};
