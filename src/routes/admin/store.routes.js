import { Router } from "express";
import * as StoreController from "../../controllers/admin/store.controller.js";
import { upload } from "../../middlewares/multer.middleware.js";
import * as StoreValidation from '../../validations/store.validation.js';
import validate from "../../middlewares/validate.js";
import { verifyJWT } from "../../middlewares/admin.auth.middleware.js";

const router = Router();

// Route for changing store password
router.put("/store/change_password", verifyJWT, validate(StoreValidation.changePassword), StoreController.changePassword);

// Route to fetch all store
router.get("/store", StoreController.getAllStores);

// Route to fetch a single store by ID
router.get("/store/:id", validate(StoreValidation.getAdminById), StoreController.getStoreById);

// Route to create a new store (POST)
router.post("/store", upload.fields([
    {
        name: "avatar",
        maxCount: 1
    },
    {
        name: "image",
        maxCount: 1
    }
]), StoreController.createStore);


// Route to update an existing store (PUT)
router.put("/store/:id", upload.single("image"), StoreController.updateStoreById);

// Route to soft delete a Store by ID (DELETE)
router.delete("/store/:id", validate(StoreValidation.softDeleteStoreById), StoreController.softDeleteStoreById);

// Route for Store login
router.post("/store/login", validate(StoreValidation.StoreLogin), StoreController.storeLogin);

// Route for Store logout
router.post("/store/logout", verifyJWT, StoreController.storeLogout);

// Route for address update
router.put("/store/:id/address", StoreController.updateAddress);

// Route for updating opening hours (changed to PUT for updates)
router.put("/store/:id/opening_hours", verifyJWT, StoreController.updateOpeningHours);

export default router;
