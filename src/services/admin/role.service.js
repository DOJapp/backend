import {Role} from "../../models/role.model.js";
import { ApiError } from "../../utils/ApiError.js";
import httpStatus from "http-status";

// Function to create a new Role
const createRole = async (data) => {
    const { name, permissions, status } = data; // Adjust fields as necessary

    // Validate required fields
    if (!name) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Name is required.");
    }
   
    if (!status) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Status is required.");
    }

    const existingRole = await Role.findOne({ name });

    if (existingRole) {
        throw new ApiError(httpStatus.CONFLICT, "Role already exists.");
    }

    // Prepare Role data
    const roleData = {
        name,
        permissions,
        status,
    };

    // Create and save the new Role
    const newRole = new Role(roleData);

    // Save the Role to the database
    return await newRole.save();
};

// Function to fetch all Roles (including soft-deleted)
const getAllRoles = async () => {
    return await Role.find().sort({ createdAt: -1 }); // Returns all Roles, including those marked as deleted
};

// Function to fetch all active Roles (excluding soft-deleted)
const getAllActiveRoles = async () => {
    return await Role.find({ status: "Active", isDeleted: false }).sort({ createdAt: -1 });
};

// Function to fetch a Role by ID (excluding soft-deleted)
const getRoleById = async (id) => {
    const role = await Role.findById(id); 
    if (!role || role.isDeleted) {
        throw new ApiError(httpStatus.NOT_FOUND, "Role not found.");
    }
    return role;
};

// Function to update a Role by ID
const updateRoleById = async (id, data) => {
    const { name, permissions, status } = data;

    // Prepare the fields to be updated
    const updateData = {};

    if (name) updateData.name = name;
    if (permissions) updateData.permissions = permissions;
    if (status) updateData.status = status;

    const updatedRole = await Role.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedRole || updatedRole.isDeleted) {
        throw new ApiError(httpStatus.NOT_FOUND, "Role not found.");
    }

    return updatedRole;
};

// Function to soft delete a Role by ID
const softDeleteRoleById = async (id) => {
    const deletedRole = await Role.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true }
    );
    if (!deletedRole) {
        throw new ApiError(httpStatus.NOT_FOUND, "Role not found.");
    }
    return deletedRole;
};

export {
    createRole,
    getAllRoles,
    getAllActiveRoles,
    getRoleById,
    updateRoleById,
    softDeleteRoleById,
};
