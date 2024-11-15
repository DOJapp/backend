import { Router } from "express";
import * as voucherController from "../../controllers/users/voucher.controller.js"; // Updated from giftCardController
import * as voucherValidation from "../../validations/voucher.validation.js"; // Updated from giftCardValidation
import validate from "../../middlewares/validate.js";
import { verifyJWT } from "../../middlewares/users.auth.middleware.js";

const router = Router();

// Route to fetch all Coupons
router.post(
  "/vouchers/redeem",
  validate(voucherValidation.redeem),
  voucherController.redeemVoucher
);

export default router;
