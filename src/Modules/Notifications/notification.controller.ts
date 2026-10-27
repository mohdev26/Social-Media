import { Router } from "express";
import { authentication } from "../../Middlewares/authentication.middleware";
import { validation } from "../../Middlewares/validation.middleware";
import * as validators from "./notifications.validation";
import notificationService from "./notification.service";
const router = Router();

router.use(authentication());

router.post(
  "/device-token",
  validation(validators.deviceTokenSchema),
  notificationService.deviceToken,
);

router.delete(
  "/remove-token",
  validation(validators.deviceTokenSchema),
  notificationService.removeDeviceToken,
);

router.get(
  "/",
  validation(validators.listnotificationSchma),
  notificationService.listAllNotification,
);

router.get("/unread", notificationService.unreadCount);

router.patch(
  "/mark-as-read/notificationId",
  validation(validators.notificationParamSchema),
  notificationService.markAsRread,
);

router.patch( "/mark-all-as-read/", notificationService.markAllAsRread);

router.delete(
  "/delete/:notificationId",
  validation(validators.notificationParamSchema),
  notificationService.deleteNotification,
);

router.delete(
  "/delete",
  notificationService.clearAll,
);

export default router;
