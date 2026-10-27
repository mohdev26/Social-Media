import { HydratedDocument, Model, model, Schema, Types } from "mongoose";

export enum NotificationTypeEnum {
  FRIEND_REQUEST = "FRIEND_REQUEST",
  FRIEND_ACCEPTED = "FRIEND_ACCEPTED",
  POST_LIKE = "POST_LIKE",
  POST_COMMENT = "POST_COMME",
  COMMENT_REPLY = "COMMENT_REPLY",
}

export interface INotification {
  _id: Types.ObjectId;

  userId: Types.ObjectId;
  senderId: Types.ObjectId;
  type: NotificationTypeEnum;
  title: string;
  body: string;

  postId?: Types.ObjectId;
  commetId?: Types.ObjectId;
  requestId?: Types.ObjectId;
  readAt?: Date;
  createdAt: Date;
  ubdateAt?: Date;
}
export const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "user", required: true },

    type: {
      type: String,
      enum: Object.values(NotificationTypeEnum),
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },

    postId: { type: Schema.Types.ObjectId, ref: "post" },
    commetId: { type: Schema.Types.ObjectId, ref: "Comment" },
    requestId: { type: Schema.Types.ObjectId, ref: "FriendRequest" },

    readAt: {type: Date},
  },
  { timestamps: true },
);

notificationSchema.index({ postId: 1, createdAt: -1 });
notificationSchema.index({ postId: 1, readAt: 1 });

notificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 30 },
);

export const NotificationModel: Model<INotification> = model<INotification>(
  "Notification",
  notificationSchema,
);
export type HNotificationDocument = HydratedDocument<INotification>;
