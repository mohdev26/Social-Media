import { Types } from "mongoose";
import { HUserDocument, UserModel } from "../../DB/Models/user.model";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "../response/error.response";
import { ConversationModel } from "../../DB/Models/conversation.model";
import { Server } from "socket.io";
import { AuthedSocket } from "./socket.service";
import { handleEvent } from "./socket.helper";
import { ZodType } from "zod";
import { MessageModel } from "../../DB/Models/message.model";
import { isUserOnline } from "./connected.users";
import * as validators from "../../Modules/chat/chat.validation";

const getChatPartener = async (
  me: HUserDocument,
  otherId: string,
): Promise<HUserDocument> => {
  if (otherId === me._id.toString())
    throw new BadRequestException("You connt chat With Yourself");

  const other = await UserModel.findById(otherId);
  if (!other) throw new NotFoundException("User Not Found");

  const iBlockedHim = me.blockedUsers?.some((id) => id.equals(other.id));
  const heBlockedMe = other.blockedUsers?.some((id) => id.equals(me._id));

  if (iBlockedHim || heBlockedMe)
    throw new ForbiddenException("You cannot message this user");

  if (!me.friends?.some((id) => id.equals(other._id)))
    throw new ForbiddenException("you can only chat with friends");

  return other;
};

const findOrcreateConversation = async (
  userA: Types.ObjectId,
  userB: Types.ObjectId,
) => {
  return ConversationModel.findOneAndUpdate(
    { participants: { $all: [userA, userB] } },
    { $setOnInsert: { participants: [userA, userB] } },
    { upsert: true, new: true },
  );
};

export const registerChatEvents = (io: Server, socket: AuthedSocket): void => {
  const user = socket.user!;
  const userId = user?._id.toString();
  const sendMessageSchema = {} as ZodType;

  socket.on(
    "sendMessage",
    handleEvent(socket, "sendMessage", sendMessageSchema, async (data) => {
      const reciver = await getChatPartener(user, data.to);

      const conversation = await findOrcreateConversation(
        user._id,
        reciver._id,
      );
      const message = await MessageModel.create({
        conversationId: conversation._id,
        senderId: user._id,
        recivierId: reciver._id,
        content: data.content,
      });
      await ConversationModel.updateOne(
        { _id: conversation._id },
        {
          lastMessage: message.content,
          lastMessageAt: message.createdAt,
          lastMessageBy: user._id,
        },
      );

      const payload = {
        _id: message._id,
        conversationId: conversation._id,
        content: message.content,
        createdAt: message.createdAt,
        reciverId: reciver._id,
        sender: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      };
      io.to(data.to).emit("newMessage", payload);

      io.to(userId).emit("MessageSent", {
        ...payload,
        deliverd: isUserOnline(data.to),
      });
    }),
  );

  socket.on(
    "typing",
    handleEvent(socket, "typing", validators.typingSchema, (data) => {
      io.to(data.to).emit("userTyping", { userId, firstName: user.firstName });
    }),
  );

  socket.on(
    "stopTyping",
    handleEvent(socket, "stopTyping", validators.typingSchema, (data) => {
      io.to(data.to).emit("userStopTyping", { userId, firstName: user.firstName });
    }),
  );
};
