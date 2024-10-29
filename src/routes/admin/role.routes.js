import { Router } from "express";
import * as RoleController from "../../controllers/admin/role.controller.js"; // Ensure the path is correct
import * as RoleValidation from '../../validations/role.validation.js'; // Validation rules
import validate from "../../middlewares/validate.js"; // Validation middleware
import { verifyJWT } from "../../middlewares/admin.auth.middleware.js"; // Ensure the path is correct

const router = Router();

// Route to fetch all roles
router.get("/roles", verifyJWT, RoleController.getAllRoles);

// Route to fetch a single role by ID
router.get("/roles/:id", verifyJWT, validate(RoleValidation.getRoleById), RoleController.getRoleById);

// Route to create a new role (POST)
router.post("/roles", verifyJWT, validate(RoleValidation.createRole), RoleController.createRole);

// Route to update an existing role (PUT)
router.put("/roles/:id", verifyJWT, validate(RoleValidation.updateRoleById), RoleController.updateRoleById);

// Route to soft delete a role by ID (DELETE)
router.delete("/roles/:id", verifyJWT, RoleController.softDeleteRoleById);

export default router;
