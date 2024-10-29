import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const giftCardCategorySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true, // Each category name must be unique
            trim: true, // Remove extra whitespace
        },
        description: {
            type: String,
            default: '', // Optional description for the category
        },
        image: {
            type: String,
            default: '', // Optional image URL for the category
        },
        status: {
            type: String,
            enum: ['Active', 'Blocked'],
            required: true,
        },
        isDeleted: {
            type: Boolean,
            default: false, // Indicates whether the category is deleted
        },
    },
    {
        collection: 'GiftCardCategory',
        timestamps: true, // Automatically add createdAt and updatedAt timestamps
    }
);

// Middleware to filter out deleted categories
const filterDeleted = function (next) {
    this.where({ isDeleted: { $ne: true } });
    next();
};

// Apply the filterDeleted middleware to all relevant find operations
giftCardCategorySchema.pre('find', filterDeleted);
giftCardCategorySchema.pre('findOne', filterDeleted);
giftCardCategorySchema.pre('findOneAndUpdate', filterDeleted);
giftCardCategorySchema.pre('findById', filterDeleted);

export const GiftCardCategory = model('GiftCardCategory', giftCardCategorySchema);
