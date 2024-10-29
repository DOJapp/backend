import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const termConditionSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        page: {
            type: String,
            required: true,
            enum: ['User', 'Admin'] // Admin as store
        },
        description: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['Active', 'Blocked'],
            default: 'Active'
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { collection: 'TermCondition', timestamps: true }
);


const excludeDeletedRecords = function (next) {
    this.where({ isDeleted: { $ne: true } });
    next();
};

termConditionSchema.pre('find', excludeDeletedRecords);
termConditionSchema.pre('findOne', excludeDeletedRecords);
termConditionSchema.pre('findOneAndUpdate', excludeDeletedRecords);
termConditionSchema.pre('findOneAndDelete', excludeDeletedRecords);
termConditionSchema.pre('findOneAndRemove', excludeDeletedRecords);

export const TermCondition = model('TermCondition', termConditionSchema);