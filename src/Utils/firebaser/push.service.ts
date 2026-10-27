import { Types } from "mongoose";
import {
  NotificationModel,
  NotificationTypeEnum,
} from "../../DB/Models/notification.model";
import { UserModel } from "../../DB/Models/user.model";
import { getMessaging } from "firebase-admin/messaging";

export interface INotificationPayload {
  userId: Types.ObjectId;
  senderId: Types.ObjectId;
  type: NotificationTypeEnum;
  title: string;
  body: string;
  postId?: Types.ObjectId;
  commentId?: Types.ObjectId;
  requestId?: Types.ObjectId;
}

const builData = (paylaod: INotificationPayload): Record<string, string> => {
  const data: Record<string, string> = {
    type: paylaod.type,
    senderId: paylaod.senderId.toString(),
  };
  if (paylaod.postId) data.postId = paylaod.postId.toString();
  if (paylaod.commentId) data.commentId = paylaod.commentId.toString();
  if (paylaod.requestId) data.commentId = paylaod.requestId.toString();
  return data;
};

export const sendNotification = async (
  payload: INotificationPayload,
): Promise<void> => {
  try {
    if (payload.userId.equals(payload.senderId)) return;
    const recipient = await UserModel.findById(payload.userId).select(
      "deviceTokens notificationEnabled blockedUsers",
    );
    if (!recipient) return;

    if (recipient.blockedUsers?.some((id) => id.equals(payload.senderId)))
      return;

    await NotificationModel.create({
      userId: payload.userId,
      senderId: payload.senderId,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      ...(payload.postId && { postId: payload.postId }),
      ...(payload.commentId && { postId: payload.commentId }),
      ...(payload.requestId && { postId: payload.requestId }),
    });

    if (recipient.notificationEnabled === false) {
      console.log("[push] skipped - user has notification diabled");
      return;
    }

    const tokens = recipient.deviceTokens ?? [];
    if (!tokens.length) {
      console.log("[push] skipped - user has no registerd devices");
      return;
    }

    const messaging = getMessaging();
    if (!messaging) {
      console.log("[push] skipped - Firebase is not intialized");
      return;
    }

    const response = await messaging.sendEachForMulticast({
      tokens,
      notification: { title: payload.title, body: payload.body },
      data: builData(payload),
    });

    console.log(
      `[Push] success:${response.successCount}, failure: ${response.failureCount}`,
    );
  } catch (error) {
    console.log("[Push] failed to send notification:", error);
  }
};

export const sendNotificationTomany = async (
  userIds: Types.ObjectId[],
  payload: Omit<INotificationPayload, "userId">,
): Promise<void> => {
  await Promise.all(
    userIds.map((userId) => sendNotification({ ...payload, userId })),
  );
};
