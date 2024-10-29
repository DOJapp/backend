import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    permissions: {
        type: [String], 
        default: [],
    },
    status: {
        type: String,
        enum: ['Active', 'Blocked'],
        default: 'Active',
    },
    isDeleted: {
        type: Boolean,
        default: false,
    }
}, 
{ collection: 'Roles', timestamps: true }
);

// Middleware to filter out soft-deleted roles
const filterDeletedRoles = function (next) {
    this.where({ isDeleted: { $ne: true } });
    next();
};

// Apply the filter to relevant queries
roleSchema.pre('find', filterDeletedRoles);
roleSchema.pre('findOne', filterDeletedRoles);
roleSchema.pre('findOneAndUpdate', filterDeletedRoles);
roleSchema.pre('findByIdAndUpdate', filterDeletedRoles);

export const Role = mongoose.model('Role', roleSchema);
