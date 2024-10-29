import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const bannerSchema = new Schema(
  {
    image: {
      type: String,
      required: true,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: false, // Optional field
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: false, // Optional field
    },
    status: {
      type: String,
      enum: ['Active', 'Blocked'],
      required: true, // 'Active' or 'Blocked' must be provided
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: 'Banner',
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Middleware to filter out deleted banners
const filterDeleted = function (next) {
  this.where({ isDeleted: { $ne: true } });
  next();
};

// Apply the filterDeleted middleware to all find operations
bannerSchema.pre('find', filterDeleted);
bannerSchema.pre('findOne', filterDeleted);
bannerSchema.pre('findOneAndUpdate', filterDeleted);
bannerSchema.pre('findById', filterDeleted);

export const Banners = model('Banner', bannerSchema);
