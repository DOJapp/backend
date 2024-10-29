import { Router } from "express";
import * as couponController from "../../controllers/store/coupon.controller.js"; // Updated from giftCardController
import * as couponValidation from '../../validations/coupon.validation.js'; // Updated from giftCardValidation
import validate from "../../middlewares/validate.js";
import { verifyJWT } from "../../middlewares/admin.auth.middleware.js";

const router = Router();

// Route to fetch all Coupons
router.get("/coupons", verifyJWT, couponController.getAllCoupons); // Updated method call

// Route to fetch a single Coupon by ID
router.get("/coupons/:id", verifyJWT, validate(couponValidation.getById), couponController.getById); // Updated method call

// Route to create a new Coupon (POST)
router.post("/coupons", verifyJWT, validate(couponValidation.createCoupon), couponController.createCoupons); // Updated method call

// Route to update an existing Coupon (PUT)
router.put("/coupons/:id", verifyJWT, validate(couponValidation.updateById), couponController.updateById); // Updated method call

// Route to update the expiry date of a Coupon (PATCH)
router.patch("/coupons/:id/expiry", verifyJWT, validate(couponValidation.updateExpiryDateById), couponController.updateExpiryDate); // Updated method call

// Route to soft delete a Coupon by ID (DELETE)
router.delete("/coupons/:id", verifyJWT, validate(couponValidation.softDeleteById), couponController.softDeleteById); // Updated method call

export default router;
