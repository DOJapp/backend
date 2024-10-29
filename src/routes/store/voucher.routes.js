import { Router } from "express";
import * as voucherController from "../../controllers/store/voucher.controller.js";
import * as voucherValidation from '../../validations/voucher.validation.js';
import validate from "../../middlewares/validate.js";
import { verifyJWT } from "../../middlewares/admin.auth.middleware.js";

const router = Router();

// Route to fetch all Vouchers
router.get("/vouchers", verifyJWT, voucherController.getAllVouchers); // Updated method and path

// Route to fetch a single Voucher by ID
router.get("/vouchers/:id", verifyJWT, validate(voucherValidation.getById), voucherController.getVoucherById);

// Route to create a new Voucher (POST)
router.post("/vouchers", verifyJWT, validate(voucherValidation.createVoucher), voucherController.createVoucher); // Updated method name and validation

// Route to update an existing Voucher (PUT)
router.put("/vouchers/:id", verifyJWT, validate(voucherValidation.updateById), voucherController.updateVoucherById);

// Route to update the expiry date of a Voucher (PATCH)
router.patch("/vouchers/:id/expiry", verifyJWT, validate(voucherValidation.updateExpiryDateById), voucherController.updateVoucherExpiryDate);

// Route to soft delete a Voucher by ID (DELETE)
router.delete("/vouchers/:id", verifyJWT, validate(voucherValidation.softDeleteById), voucherController.softDeleteVoucherById);

export default router;
