import mongoose, { Schema, model } from "mongoose";

const productsSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: false, // Ensure product name is unique
        },
        description: {
            type: String,
            required: false,
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
        },
        deliveryMode: { // Corrected 'deleveryMode' to 'deliveryMode'
            type: String,
            enum: ['instant', 'scheduled'], // Corrected 'instnt' to 'instant'
            default: 'instant',
        },
        quantity: {
            type: Number,
            default: 0,
            min: 0, // Added minimum value for quantity
        },
        image: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            default: 0,
            min: 0, // Added minimum value for price
        },
        discount: {
            type: Number,
            default: 0,
            min: 0, // Added minimum value for discount
        },
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            required: true,
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            default: null,
        },
        status: {
            type: String,
            enum: ['Active', 'Blocked'], // Corrected 'Blocked' to 'Blocked'
            required: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { collection: 'Product', timestamps: true } // Corrected collection name from 'Category' to 'Products'
);

// Pre-save hook to capitalize the name
productsSchema.pre('save', function (next) {
    if (this.isNew || this.isModified('name')) { // Corrected 'title' to 'name'
        this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1);
    }
    next();
});

// Middleware to filter out deleted products
const filterDeleted = function (next) {
    this.where({ isDeleted: { $ne: true } });
    next();
};

// Apply the filter to relevant queries
productsSchema.pre('find', filterDeleted);
productsSchema.pre('findOne', filterDeleted);
productsSchema.pre('findOneAndUpdate', filterDeleted);
productsSchema.pre('findByIdAndUpdate', filterDeleted);

// Create the Product model
const Product = model('Product', productsSchema); // Changed 'Products' to 'Product' for singular

export default Product;
