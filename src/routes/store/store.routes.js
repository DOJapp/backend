import { Router } from "express";
import * as StoreController from "../../controllers/store/store.controller.js";
import { upload } from "../../middlewares/multer.middleware.js";
import * as StoreValidation from '../../validations/store.validation.js';
import validate from "../../middlewares/validate.js";
import { verifyJWT } from "../../middlewares/admin.auth.middleware.js";

const router = Router();

// Route to fetch a single Store by ID
router.get("/:id", validate(StoreValidation.getById), StoreController.getStoreById);

// Route to update an existing Store (PUT)
router.put("/:id", upload.single("image"), StoreController.updateAddress);

// Route for Store login
router.post("/login", validate(StoreValidation.storeLogin), StoreController.storeLogin);

// Route for Store logout
router.post("/logout", verifyJWT, StoreController.storeLogout);

// Route for changing Store password
router.put("/change_password", verifyJWT, validate(StoreValidation.changePassword), StoreController.changePassword);


export default router;
