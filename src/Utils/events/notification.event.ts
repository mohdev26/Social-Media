import { EventEmitter } from "node:events";
import { Types } from "mongoose";
import { sendNotification } from "../firebaser/push.service";
import { NotificationTypeEnum } from "../../DB/Models/notification.model";

export const notificationEvent = new EventEmitter();

interface IActor {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
}

const fullName = (user: IActor): string => {
  return `${user.firstName} ${user.lastName}`.trim();
};

notificationEvent.on(
  "friendRequest",
  async (data: {
    to: Types.ObjectId;
    sender: IActor;
    requestId: Types.ObjectId;
  }) => {
    await sendNotification({
      userId: data.to,
      senderId: data.sender._id,
      type: NotificationTypeEnum.FRIEND_REQUEST,
      title: "new Friend Request",
      body: `${fullName(data.sender)}send you a friend request`,
      requestId: data.requestId,
    });
  },
);
notificationEvent.on(
  "friendAccepted",
  async (data: { to: Types.ObjectId; sender: IActor }) => {
    await sendNotification({
      userId: data.to,
      senderId: data.sender._id,
      type: NotificationTypeEnum.FRIEND_ACCEPTED,
      title: "new Request Accepted",
      body: `${fullName(data.sender)} accepted you a friend request`,
    });
  },
);

notificationEvent.on(
  "postLike",
  async (data: {
    to: Types.ObjectId;
    sender: IActor;
    postId: Types.ObjectId;
  }) => {
    await sendNotification({
      userId: data.to,
      senderId: data.sender._id,
      type: NotificationTypeEnum.POST_LIKE,
      title: "New Like",
      body: `${fullName(data.sender)} like your post`,
      postId: data.postId,
    });
  },
);

notificationEvent.on(
  "postComment",
  async (data: {
    to: Types.ObjectId;
    sender: IActor;
    postId: Types.ObjectId;
    commentId: Types.ObjectId;
    content: string;
  }) => {
    await sendNotification({
      userId: data.to,
      senderId: data.sender._id,
      type: NotificationTypeEnum.POST_COMMENT,
      title: "New Comment",
      body: `${fullName(data.sender)} Commented: ${data.content}`,
      postId: data.postId,
      commentId: data.commentId,
    });
  },
);


notificationEvent.on(
  "commentReply",
  async (data: {
    to: Types.ObjectId;
    sender: IActor;
    postId: Types.ObjectId;
    commentId: Types.ObjectId;
    content: string;
  }) => {
    await sendNotification({
      userId: data.to,
      senderId: data.sender._id,
      type: NotificationTypeEnum.COMMENT_REPLY,
      title: "New Repiy",
      body: `${fullName(data.sender)} replied: ${data.content}`,
      postId: data.postId,
      commentId: data.commentId,
    });
  },
);
