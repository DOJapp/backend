import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const PrivacyPolicySchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        page: {
            type: String,
            required: true,
            enum: ['User', 'Admin'] // Admin as Store
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
    { collection: 'PrivacyPolicy', timestamps: true }
);


const excludeDeletedRecords = function (next) {
    this.where({ isDeleted: { $ne: true } });
    next();
};

PrivacyPolicySchema.pre('find', excludeDeletedRecords);
PrivacyPolicySchema.pre('findOne', excludeDeletedRecords);
PrivacyPolicySchema.pre('findOneAndUpdate', excludeDeletedRecords);
PrivacyPolicySchema.pre('findOneAndDelete', excludeDeletedRecords);
PrivacyPolicySchema.pre('findOneAndRemove', excludeDeletedRecords);

export const PrivacyPolicy = model('PrivacyPolicy', PrivacyPolicySchema);