import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const categorySchema = new Schema(
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
        image: {
            type: String,
            required: true,
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
    { collection: 'Category', timestamps: true }
);

categorySchema.pre('save', function (next) {
    if (this.isNew || this.isModified('title')) {
        this.title = this.title.charAt(0).toUpperCase() + this.title.slice(1);
    }
    next();
});


const filterDeleted = function (next) {
    this.where({ isDeleted: { $ne: true } });
    next();
};

categorySchema.pre('find', filterDeleted);
categorySchema.pre('findOne', filterDeleted);
categorySchema.pre('findOneAndUpdate', filterDeleted);
categorySchema.pre('findByIdAndUpdate', filterDeleted);

const Category = model('Category', categorySchema);

export default Category;
