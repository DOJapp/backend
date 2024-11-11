import Product from "../../models/product.model.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import { ApiError } from "../../utils/ApiError.js";
import httpStatus from "http-status";

const createProduct = async (req, files) => {
  const {
    name,
    description,
    categoryId,
    deliveryMode,
    quantity,
    price,
    discount,
    status,
  } = req.body;

  const addedBy = req?.admin?._id;

  const avatarLocalPath = files?.image ? files.image[0]?.path : null;
  const galleryImagePaths = files?.galleryImages ? files.galleryImages.map(file => file.path) : [];

  const avatarUrl = avatarLocalPath ? await uploadOnCloudinary(avatarLocalPath) : null;
  const galleryUrls = await Promise.all(
    galleryImagePaths.map(path => uploadOnCloudinary(path))
  );

  if (avatarLocalPath && !avatarUrl) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error while uploading the main image"
    );
  }

  if (galleryImagePaths.length && galleryUrls.some(url => !url)) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error while uploading gallery images"
    );
  }
  const galleryImageUrls = galleryUrls.map(url => url.url);

  const productData = {
    name,
    description,
    categoryId,
    deliveryMode,
    quantity,
    price,
    discount: discount || 0,
    status,
    adminId: addedBy,
    image: avatarUrl?.url || null,
    galleryImages: galleryImageUrls,
  };

  const newProduct = new Product(productData);
  return await newProduct.save();
};


const getAllProducts = async () => {
  return await Product.find().populate("categoryId").populate("adminId").sort({ createdAt: -1 });
};

const getAllActiveProducts = async () => {
  return await Product.find({ status: "Active" }).populate("categoryId").sort({ createdAt: -1 });
};

const getProductById = async (id) => {
  const product = await Product.findById(id);

  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }

  return product;
};


const updateProductById = async (id, data, files) => {
  const {
    name,
    description,
    categoryId,
    deliveryMode,
    quantity,
    price,
    discount,
    status,
  } = data;

  const updateData = {};

  const avatarLocalPath = files?.image ? files.image[0]?.path : null;
  if (avatarLocalPath) {
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (avatar?.url) {
      updateData.image = avatar.url;
    } else {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Error while uploading avatar"
      );
    }
  }

  const galleryImagePaths = files?.galleryImages ? files.galleryImages.map(file => file.path) : [];
  if (galleryImagePaths.length) {
    const galleryUrls = await Promise.all(
      galleryImagePaths.map(path => uploadOnCloudinary(path))
    );

    if (galleryUrls.some(url => !url)) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Error while uploading gallery images"
      );
    }

    updateData.galleryImages = galleryUrls.map(url => url.url);
  }

  if (name) updateData.name = name;
  if (description) updateData.description = description;
  if (categoryId) updateData.categoryId = categoryId;
  if (deliveryMode) updateData.deliveryMode = deliveryMode;
  if (quantity) updateData.quantity = quantity;
  if (price) updateData.price = price;
  if (discount !== undefined) updateData.discount = discount;
  if (status) updateData.status = status;

  const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
  });

  if (!updatedProduct) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }

  return updatedProduct;
};


// Function to soft delete a product by ID
const softDeleteProductById = async (id) => {
  return await Product.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
};

export {
  createProduct,
  getAllProducts,
  getAllActiveProducts,
  getProductById,
  updateProductById,
  softDeleteProductById,
};
