
import { Router } from "express";
import storeRouter from "./store.routes.js";
import productRouter from "./product.routes.js";
import notificationRoute from "./notification.routes.js";
import userNotificationRoute from "./user.notification.routes.js";
import couponRoute from "./coupon.routes.js";
import voucherRoute from "./voucher.routes.js";

const router = Router();

// Mount the userRouter at /users
router.use("/", productRouter);
router.use("/", notificationRoute);
router.use("/", notificationRoute);
router.use("/", userNotificationRoute);
router.use("/", couponRoute);
router.use("/", voucherRoute);
// router.use("/", storeRouter);

export default router;
