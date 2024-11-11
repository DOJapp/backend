import { Router } from "express";
import { upload } from "../../middlewares/multer.middleware.js";
import * as productValidation from '../../validations/product.validation.js';
import * as productController from "../../controllers/admin/product.controller.js"; // Ensure the path is correct
import validate from "../../middlewares/validate.js";
import { verifyJWT } from "../../middlewares/admin.auth.middleware.js"; // Ensure the path is correct

const router = Router();

// Route to fetch all products
router.get("/products", verifyJWT, productController.getAllProducts);

// Route to fetch all Active products
router.get("/active_products", verifyJWT, productController.getAllActiveProducts);

// Route to fetch a single product by ID
router.get("/products/:id", verifyJWT, validate(productValidation.getProductById), productController.getProductById);

// Route to create a new product (POST)
router.post("/products", verifyJWT,
    upload.fields([
        {
            name: "image",
            maxCount: 1,
        },
        {
            name: "galleryImages",
            maxCount: 5,
        },
    ]),
    productController.createProduct
);

// Route to update an existing product (PUT)
router.put("/products/:id", verifyJWT, upload.fields([
    {
        name: "image",
        maxCount: 1,
    },
    {
        name: "galleryImages",
        maxCount: 5,
    },
]), validate(productValidation.updateProductById), productController.updateProductById);

// Route to soft delete a product by ID (DELETE)
router.delete("/products/:id", verifyJWT, validate(productValidation.softDeleteProductById), productController.softDeleteProductById); // Changed softDeleteBannerById to softDeleteProductById

export default router;
