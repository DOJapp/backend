import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const { Schema, model } = mongoose;

const couponsSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        code: {
            type: String,
            unique: true,
            match: /^[A-Z0-9-]+$/,
        },
        discountType: {
            type: String,
            enum: ['Percentage', 'Fixed'],
            required: true,
        },
        discountValue: {
            type: Number,
            required: true,
            min: 0, // Ensures discount value is non-negative
        },
        usagePerUser: {
            type: Number,
            required: true,
            min: 0,
        },
        minOrderValue: {
            type: Number,
            required: true,
            min: 0,
        },
        userId: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        }],
        adminId: {
            type: Schema.Types.ObjectId,
            ref: 'Admin',
            required: false,
        },
        status: {
            type: String,
            enum: ['Active', 'Blocked', 'Redeemed', 'Expired'],
            default: 'Active', // Default status when a coupon is created
        },
        expiryDate: {
            type: Date,
            default: () => {
                const currentDate = new Date();
                currentDate.setFullYear(currentDate.getFullYear() + 1); // Default expiry date is set to 1 year from now
                return currentDate;
            },
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        collection: 'Coupons',
        timestamps: true, // Automatically manages createdAt and updatedAt timestamps
    }
);

// Generate a unique coupon code
const generateUniqueCode = async function () {
    let code;
    let isUnique = false;

    while (!isUnique) {
        // Generate a random code with the desired format
        const part1 = nanoid(3).toUpperCase().replace(/[^A-Z0-9]/g, ''); // First part (3 characters)
        const part2 = nanoid(3).toUpperCase().replace(/[^A-Z]/g, '');  // Second part (3 uppercase letters)
        const part3 = nanoid(6).toUpperCase().replace(/[^A-Z0-9]/g, ''); // Third part (6 characters)

        // Combine parts with hyphens to create the final code
        code = `${part1}-${part2}-${part3}`; // Combine parts with hyphens

        // Check if the generated code already exists
        const existingCode = await Coupon.findOne({ code });
        if (!existingCode) {
            isUnique = true; // Ensure the generated code is unique
        }
    }

    return code;
};

// Middleware to handle automated generation of code
couponsSchema.pre('save', async function (next) {
    if (this.isNew && !this.code) {
        try {
            this.code = await generateUniqueCode();
        } catch (error) {
            return next(new Error('Error generating unique code: ' + error.message));
        }
    }
    next();
});


// Middleware to filter out deleted notifications
const filterDeleted = function (next) {
    this.where({ isDeleted: { $ne: true } });
    next();
};

// Apply the filterDeleted middleware to all find operations
couponsSchema.pre('find', filterDeleted);
couponsSchema.pre('findOne', filterDeleted);
couponsSchema.pre('findOneAndUpdate', filterDeleted);
couponsSchema.pre('findById', filterDeleted);

export const Coupon = model('Coupon', couponsSchema);
