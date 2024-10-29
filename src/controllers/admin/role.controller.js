import * as RoleService from '../../services/admin/role.service.js';
import { ApiError } from "../../utils/ApiError.js";
import httpStatus from 'http-status';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from "../../utils/asyncHandler.js";

// Create a new Role
const createRole = asyncHandler(async (req, res) => {
 
    // Create the Role with the provided data
    const result = await RoleService.createRole(req.body);

    return res.status(httpStatus.CREATED).json(
        new ApiResponse(httpStatus.CREATED, result, "Role created successfully")
    );
});

// Fetch all active Roles
const getAllRoles = asyncHandler(async (req, res) => {
    const roles = await RoleService.getAllRoles();

    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, roles, "Roles fetched successfully")
    );
});

// Fetch a single Role by ID
const getRoleById = asyncHandler(async (req, res) => {
    const role = await RoleService.getRoleById(req.params.id);

    if (!role) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
    }

    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, role, "Role fetched successfully")
    );
});

// Update a Role by ID
const updateRoleById = asyncHandler(async (req, res) => {
    const { name, permissions, status } = req.body; // Extract fields for update

    const updatedRole = await RoleService.updateRoleById(req.params.id, {
        name,
        permissions,
        status // Update status if provided
    });

    if (!updatedRole) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
    }

    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, updatedRole, "Role updated successfully")
    );
});

// Soft delete a Role by ID (logical deletion)
const softDeleteRoleById = asyncHandler(async (req, res) => {
    const deletedRole = await RoleService.softDeleteRoleById(req.params.id);

    if (!deletedRole) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
    }

    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, deletedRole, "Role deleted successfully")
    );
});

export {
    createRole,
    getAllRoles,
    getRoleById,
    updateRoleById,
    softDeleteRoleById,
};
