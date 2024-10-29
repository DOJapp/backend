import Product from '../../models/product.model.js';
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import { ApiError } from "../../utils/ApiError.js";
import httpStatus from "http-status";


// Function to create a new Product
const createProduct = async (req, avatarLocalPath) => {
    const { name, description, categoryId, deliveryMode, quantity, price, discount, status } = req.body;
    const addedBy = req?.admin?._id ?? null;

    // Upload the avatar to Cloudinary using the local file path
    const avatar = avatarLocalPath ? await uploadOnCloudinary(avatarLocalPath) : null;

    // Check if the Cloudinary upload was successful if an image was provided
    if (avatarLocalPath && !avatar.url) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error while uploading avatar");
    }

    // Prepare product data with Cloudinary URL if available
    const productData = {
        name,
        description,
        categoryId,
        deliveryMode,
        quantity,
        price,
        discount: discount,
        status,
        adminId: addedBy,
        image: avatar ? avatar.url : null,
    };

    // Create a new product using the processed data
    const newProduct = new Product(productData);

    // Save the new product to the database
    return await newProduct.save();
};


// Function to fetch all products (excluding deleted)
const getAllProducts = async (req) => {
    const adminId = req?.admin?._id;
    return await Product.find({ adminId: adminId }); // Middleware filters deleted products if set
};

// Function to fetch all active products (excluding deleted or blocked)
const getAllActiveProducts = async () => {
    return await Product.find({ status: "Active" }); // Fetches only active products
};

// Function to fetch a product by ID (excluding deleted)
const getProductById = async (id) => {
    const product = await Product.findById(id); // Middleware filters deleted products if set

    // Check if product exists
    if (!product) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
    }

    return product;
};

// Function to update a product by ID
const updateProductById = async (id, data, avatarLocalPath) => {
    const { name, description, categoryId, deliveryMode, quantity, price, discount, status } = data;
    const updateData = {}; // Initialize an empty object for the fields to be updated

    // Check if avatarLocalPath exists, then upload the new image and update the image URL
    if (avatarLocalPath) {
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        if (avatar?.url) {
            updateData.image = avatar.url; // Add the new avatar URL to updateData
        } else {
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error while uploading avatar");
        }
    }

    // Update all other fields if they are provided in the request data
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (categoryId) updateData.categoryId = categoryId;
    if (deliveryMode) updateData.deliveryMode = deliveryMode;
    if (quantity) updateData.quantity = quantity;
    if (price) updateData.price = price;
    if (discount !== undefined) updateData.discount = discount;
    if (status) updateData.status = status;

    // Update the product with the new data
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });

    // Check if the product exists and was updated
    if (!updatedProduct) {
        throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
    }

    return updatedProduct; // Return the updated document
};

// Function to soft delete a product by ID
const softDeleteProductById = async (id) => {
    return await Product.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
};

export {
    createProduct,
    getAllProducts,
    getAllActiveProducts,
    getProductById,
    updateProductById,
    softDeleteProductById
};
