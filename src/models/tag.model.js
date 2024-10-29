import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const tagSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true,
            index: true
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
    { collection: 'Tag', timestamps: true }
);

const filterDeleted = function (next) {
    this.where({ isDeleted: { $ne: true } });
    next();
};

tagSchema.pre('find', filterDeleted);
tagSchema.pre('findOne', filterDeleted);
tagSchema.pre('findOneAndUpdate', filterDeleted);
tagSchema.pre('findByIdAndUpdate', filterDeleted);

const Tag = model('Tag', tagSchema);

export default Tag;
