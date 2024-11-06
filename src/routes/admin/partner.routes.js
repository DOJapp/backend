import { Router } from "express";
import * as PartnerController from "../../controllers/admin/partner.controller.js"; // Ensure the path is correct
import { upload } from "../../middlewares/multer.middleware.js";
import * as PartnerValidation from "../../validations/partner.validation.js";
import validate from "../../middlewares/validate.js";
import { verifyJWT } from "../../middlewares/admin.auth.middleware.js"; // Ensure the path is correct

const router = Router();

// Route to fetch all partners
router.get("/partners/", verifyJWT, PartnerController.getAllPartners);

// Route to fetch a single partner by ID
router.get(
  "/partners/:id",
  verifyJWT,
  validate(PartnerValidation.getPartnerById),
  PartnerController.getPartnerById
);

// Route to create a new partner (POST)
router.post(
  "/partners",
  upload.fields([
    {
      name: "aadharFrontImage",
      maxCount: 1,
    },
    {
      name: "aadharBackImage",
      maxCount: 1,
    },
    {
      name: "panImage",
      maxCount: 1,
    },
    {
      name: "documentImages",
      maxCount: 5,
    },
  ]),
  validate(PartnerValidation.createPartner),
  PartnerController.createPartner
);


router.put(
  "/partners/basic_details/:id",
  verifyJWT,
  validate(PartnerValidation.updatePartnerBasicDetailsById),
  PartnerController.updatePartnerBasicDetailsById
);


router.put(
  "/partners/gst_details/:id",
  verifyJWT,
  upload.fields([
    {
      name: "documents",
      maxCount: 5,
    },
  ]),
  validate(PartnerValidation.updateGstDetailsById),
  PartnerController.updateGstDetailsById
);


router.put(
  "/partners/firm_details/:id",
  verifyJWT,
  validate(PartnerValidation.updateFirmDetailsById),
  PartnerController.updateFirmDetailsById
);


router.put(
  "/partners/bank_details/:id",
  verifyJWT,
  validate(PartnerValidation.updateBankDetailsById),
  PartnerController.updateBankDetailsById
);


router.put(
  "/partners/partner_details/:id",
  verifyJWT,
  validate(PartnerValidation.updatePartnerDetailsById),
  PartnerController.updatePartnerDetailsById
);


router.delete(
  "/partners/:id",
  verifyJWT,
  validate(PartnerValidation.softDeletePartnerById),
  PartnerController.softDeletePartnerById
);

export default router;
