import Tag from "../../models/tag.model.js";
import { ApiError } from "../../utils/ApiError.js";
import httpStatus from "http-status";

// Function to create a new Tag
const createTag = async (data) => {
  const { title, status } = data;


  // Validate required fields
  if (!title) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Title is required.");
  }
  if (!status) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Status is required.");
  }

  const existingTag = await Tag.find({ title:title });

  if (existingTag) {
    throw new ApiError(httpStatus.CONFLICT, "Tag already exists.");
  }

  // Prepare Tag data
  const tagData = {
    title,
    status,
  };

  // Create and save the new Tag
  const newTag = new Tag(tagData);

  // Save the Tag to the database
  return await newTag.save();
};

// Function to fetch all tags (including soft-deleted)
const getAllTags = async () => {
  return await Tag.find().sort({ createdAt: -1 }); // Returns all tags, including those marked as deleted
};

// Function to fetch all active tags (excluding soft-deleted)
const getAllActiveTags = async () => {
  return await Tag.find({ status: "Active" }).sort({ createdAt: -1 });
};

// Function to fetch a Tag by ID (excluding soft-deleted)
const getTagById = async (id) => {
  const tag = await Tag.findById(id); // Corrected method name
  if (!tag) {
    throw new ApiError(httpStatus.NOT_FOUND, "Tag not found.");
  }
  return tag;
};

// Function to update a Tag by ID
const updateTagById = async (id, data) => {
  const { title, status } = data;
  console.log(data);
  // Prepare the fields to be updated
  const updateData = {};

  if (title) updateData.title = title;
  if (status) updateData.status = status;

  const updatedTag = await Tag.findByIdAndUpdate(id, updateData, { new: true });
  if (!updatedTag) {
    throw new ApiError(httpStatus.NOT_FOUND, "Tag not found.");
  }

  return updatedTag;
};

// Function to soft delete a Tag by ID
const softDeleteTagById = async (id) => {
  const deletedTag = await Tag.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  if (!deletedTag) {
    throw new ApiError(httpStatus.NOT_FOUND, "Tag not found.");
  }
  return deletedTag;
};

export {
  createTag,
  getAllTags,
  getAllActiveTags,
  getTagById,
  updateTagById,
  softDeleteTagById,
};
