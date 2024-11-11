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
      default: "null",
    },
    redirectTo: {
      type: String,
      required: true
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      default: "null",
    },
    status: {
      type: String,
      enum: ['Active', 'Blocked'],
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: 'Banner',
    timestamps: true, 
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
