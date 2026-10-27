import { authentication } from "../../Middlewares/authentication.middleware";
import { validation } from "../../Middlewares/validation.middleware";
import userService from "./user.service";
import * as validators from "./user.validation";
import { Router } from "express";

const router = Router();

router.use(authentication());

router.post(
  "/friend-request/:userId",
  validation(validators.userIdParamsSchema),
  userService.sendFriendRequest,
);

router.get(
  "/friend-request",  userService.listFriendRequest);

  router.patch(
  "/friend-request/:requestId/accept",
  validation(validators.requestIdParamsSchema),
  userService.acceptFriendRequest,
);

 router.delete(
  "/friend-request/:requestId/reject",
  validation(validators.requestIdParamsSchema),
  userService.rejectFriendRequest,
);

router.delete(
  "/friend/:userId",
  validation(validators.userIdParamsSchema),
  userService.removeFriend,
);

router.patch(
  "/block/:userId",
  validation(validators.userIdParamsSchema),
  userService.blockUser,
);

router.patch(
  "/unblock/:userId",
  validation(validators.userIdParamsSchema),
  userService.unBlockUser,
);

export default router;
