import { Router } from "express";
import { verifyJWT } from "../../middlewares/users.auth.middleware.js"; // Ensure path is correct
import * as productController from "../../controllers/users/product.controller.js"; // Ensure path is correct
import * as productValidation from "../../validations/product.validation.js";
import validate from "../../middlewares/validate.js";
import { upload } from "../../middlewares/multer.middleware.js";

const router = Router();

// Route for user registration //
router.route("/products").get(productController.getAllProducts);

// You can add more routes below as needed

export default router;
