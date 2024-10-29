import { Router } from "express";
import { upload } from "../../middlewares/multer.middleware.js";
import * as userNotificationValidation from '../../validations/user.notification.validation.js';
import * as userNotificationController from "../../controllers/store/user.notification.controller.js"; // Ensure the path is correct
import validate from "../../middlewares/validate.js";
import { verifyJWT } from "../../middlewares/admin.auth.middleware.js"; // Ensure the path is correct

const router = Router();

// Route to fetch all user notifications
router.get("/user_notifications", verifyJWT, userNotificationController.getAllUserNotifications);

// Route to fetch a single user notification by ID
router.get("/user_notifications/:id", verifyJWT, validate(userNotificationValidation.getUserNotificationById), userNotificationController.getUserNotificationById);

// Route to create a new user notification (POST)
router.post("/user_notifications", verifyJWT, validate(userNotificationValidation.createUserNotification), userNotificationController.createUserNotification);

// Route to update an existing user notification (PUT)
router.put("/user_notifications/:id", verifyJWT, validate(userNotificationValidation.updateUserNotificationById), userNotificationController.updateUserNotificationById);

// Route to soft delete a user notification by ID (DELETE)
router.delete("/user_notifications/:id", verifyJWT, validate(userNotificationValidation.softDeleteUserNotificationById), userNotificationController.softDeleteUserNotificationById);

// Route to import user notifications (POST)
router.post("/user_notifications/import", verifyJWT, upload.single("sheet"), userNotificationController.importUserNotification);

export default router;
