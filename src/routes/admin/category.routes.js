import { Router } from "express";
import * as CategoryController from "../../controllers/admin/category.controller.js"; // Ensure the path is correct
import { upload } from "../../middlewares/multer.middleware.js"; // Multer middleware for file upload
import * as categoryValidation from '../../validations/category.validation.js'; // Validation rules
import validate from "../../middlewares/validate.js"; // Validation middleware
import { verifyJWT } from "../../middlewares/admin.auth.middleware.js"; // Ensure the path is correct

const router = Router();

// Route to fetch all categories
router.get("/category", verifyJWT, CategoryController.getAllCategories);

// Route to fetch a single category by ID
router.get("/category/:id", verifyJWT, validate(categoryValidation.getCategoryById), CategoryController.getCategoryById);

// Route to create a new category (POST)
router.post("/category", verifyJWT, upload.single("image"), validate(categoryValidation.createCategory), CategoryController.createCategory);

// Route to update an existing category (PUT) 
router.put("/category/:id", verifyJWT, upload.single("image"),  CategoryController.updateCategoryById);

// Route to soft delete a category by ID (DELETE)
router.delete("/category/:id", verifyJWT, validate(categoryValidation.softDeleteCategoryById), CategoryController.softDeleteCategoryById);

export default router;
