import { Router } from "express";
import { verifyJWT } from "../../middlewares/users.auth.middleware.js"; // Ensure path is correct
import * as commonController from "../../controllers/users/common.controller.js"; // Ensure path is correct
import * as userValidation from '../../validations/common.validation.js'; // Imported but not used
import validate from "../../middlewares/validate.js"; // Imported but not used
import { upload } from "../../middlewares/multer.middleware.js"; // Imported but not used

const router = Router();

// Route for user registration
router.get("/banner",  commonController.getAllBanners);
router.get("/category", verifyJWT, commonController.getAllCategory);
router.get("/privacy_policy", verifyJWT, commonController.getPrivacyPolicy);
router.get("/term_condition", verifyJWT, commonController.getTermCondition);

// You can add more routes below as needed

export default router;
