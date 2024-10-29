import Category from "../../models/category.model.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import { ApiError } from "../../utils/ApiError.js";
import httpStatus from "http-status";

// Function to create a new category with an image
const createCategory = async (req, imageLocalPath) => {
  const { title, status } = req.body;
  const addedBy = req?.admin?._id ?? null;

  // Validate required fields
  if (!title) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Title is required.");
  }
  if (!status) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Status is required.");
  }

// const existingCategory = await Category.findOne({ title: title });
// console.log(existingCategory);

// if (existingCategory) {
//   throw new ApiError(httpStatus.CONFLICT, "Category already exists.");
// }

  // Upload the image to Cloudinary using the local file path
  const image = await uploadOnCloudinary(imageLocalPath);

  // Check if the image upload was successful
  if (!image || !image.url) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error while uploading image."
    );
  }

  // Prepare category data
  const categoryData = {
    title,
    status,
    addedBy,
    image: image.url, // Store the Cloudinary image URL
  };

  // Create and save the new category
  const newCategory = new Category(categoryData);

  // Save the category to the database
  return await newCategory.save();
};

// Function to fetch all categories (including soft-deleted)
const getAllCategories = async () => {
  return await Category.find().populate("addedBy").sort({ createdAt: -1 }); // All categories
};

// Function to fetch all categories (including soft-deleted)
const getAllActiveCategory = async () => {
  return await Category.find({ status: "Active" }); // All categories
};

// Function to fetch a category by ID (excluding soft-deleted)
const getCategoryById = async (id) => {
  const category = await Category.findOne({
    _id: id,
    isDeleted: { $ne: true },
  });
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
  }
  return category;
};

// Function to update a category by ID
const updateCategoryById = async (id, data, imageLocalPath) => {
  const { title, status, updatedBy } = data;

  // Initialize updateData with the available fields
  const updateData = { updatedBy };

  // If new image is provided, upload it
  if (imageLocalPath) {
    const image = await uploadOnCloudinary(imageLocalPath);
    updateData.image = image.url;
  }

  // If title or status are provided, add to updateData
  if (title) updateData.title = title;
  if (status) updateData.status = status;

  const updatedCategory = await Category.findByIdAndUpdate(id, updateData, {
    new: true,
  });
  if (!updatedCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
  }

  return updatedCategory;
};

// Function to soft delete a category by ID
const softDeleteCategoryById = async (id) => {
  const deletedCategory = await Category.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  if (!deletedCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
  }
  return deletedCategory;
};

export {
  createCategory,
  getAllCategories,
  getAllActiveCategory,
  getCategoryById,
  updateCategoryById,
  softDeleteCategoryById,
};
