import { Router } from "express";
import * as notificationController from "../../controllers/store/notification.controller.js";
import { upload } from "../../middlewares/multer.middleware.js";
import * as notificationValidation from '../../validations/notification.validation.js';
import validate from "../../middlewares/validate.js";
import { verifyJWT } from "../../middlewares/admin.auth.middleware.js";

const router = Router();

// Route to fetch all notifications
router.get("/notifications", verifyJWT, notificationController.getAllNotificationsByAdmin); // Fetch all notifications

// Route to fetch a single notification by ID
router.get("/notifications/:id", verifyJWT, validate(notificationValidation.getNotificationById), notificationController.getNotificationById); // Fetch notification by ID

// Route to create a new notification (POST) 
router.post("/notifications", verifyJWT, upload.single("image"), validate(notificationValidation.createNotification), notificationController.createNotification); // Create a new notification

// Route to update an existing notification (PUT)
router.put("/notifications/:id", verifyJWT, upload.single("image"), validate(notificationValidation.updateNotificationById), notificationController.updateNotificationById); // Update notification by ID

// Route to soft delete a notification by ID (DELETE)
router.delete("/notifications/:id", verifyJWT, validate(notificationValidation.softDeleteNotificationById), notificationController.softDeleteNotificationById); // Soft delete notification by ID

export default router;
