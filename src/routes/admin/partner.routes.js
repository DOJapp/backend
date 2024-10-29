import { Router } from "express";
import * as PartnerController from "../../controllers/admin/partner.controller.js"; // Ensure the path is correct
import { upload } from "../../middlewares/multer.middleware.js";
import * as PartnerValidation from '../../validations/partner.validation.js';
import validate from "../../middlewares/validate.js";
import { verifyJWT } from "../../middlewares/admin.auth.middleware.js"; // Ensure the path is correct

const router = Router();

// Route to fetch all partners
router.get("/partners/", verifyJWT, PartnerController.getAllPartners);

// Route to fetch a single partner by ID
router.get("/partners/:id", verifyJWT, validate(PartnerValidation.getPartnerById), PartnerController.getPartnerById);

// Route to create a new partner (POST)
router.post("/partners", upload.fields([
    {
        name: "avatar",
        maxCount: 1
    }, 
    {
        name: "aadharFrontImage",
        maxCount: 1
    },
    {
        name: "aadharBackImage",
        maxCount: 1
    },
    {
        name: "panImage",
        maxCount: 1
    }
]), validate(PartnerValidation.createPartner), PartnerController.createPartner);

// Route to update an existing partner (PUT)
router.put("/partners/:id", verifyJWT, upload.fields([
    {
        name: "avatar",
        maxCount: 1
    }, 
    {
        name: "aadharFrontImage",
        maxCount: 1
    },
    {
        name: "aadharBackImage",
        maxCount: 1
    },
    {
        name: "panImage",
        maxCount: 1
    }
]), validate(PartnerValidation.updatePartner), PartnerController.updatePartnerById);

// Route to soft delete a partner by ID (DELETE)
router.delete("/partners/:id", verifyJWT, validate(PartnerValidation.softDeletePartnerById), PartnerController.softDeletePartnerById);

export default router;
