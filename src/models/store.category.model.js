import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const storeCategorySchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        addedBy: {
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
            enum: ['Active', 'Blocked'],
            required: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { collection: 'StoreCategory', timestamps: true }
);

storeCategorySchema.pre('save', function (next) {
    if (this.isNew || this.isModified('title')) {
        this.title = this.title.charAt(0).toUpperCase() + this.title.slice(1);
    }
    next();
});


const filterDeleted = function (next) {
    this.where({ isDeleted: { $ne: true } });
    next();
};

storeCategorySchema.pre('find', filterDeleted);
storeCategorySchema.pre('findOne', filterDeleted);
storeCategorySchema.pre('findOneAndUpdate', filterDeleted);
storeCategorySchema.pre('findByIdAndUpdate', filterDeleted);

const StoreCategory = model('StoreCategory', storeCategorySchema);

export default StoreCategory;
