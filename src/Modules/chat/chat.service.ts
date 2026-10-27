import { Request, Response } from "express";
import { ConversationModel } from "../../DB/Models/conversation.model";
import { isUserOnline } from "../../Utils/socket/connected.users";
import { Filter } from "firebase-admin/firestore";
import { MessageModel } from "../../DB/Models/message.model";

export class ChatSevicre {
  constructor() {}

  listConveration = async (req: Request, res: Response): Promise<Response> => {
    const { page, limit } = req.query as unknown as {
      page: number;
      limit: number;
    };

    const skip = (page - 1) * limit;

    const filter = { participants: req.user!._id };

    const [conversation, total] = await Promise.all([
      ConversationModel.find(filter)
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("participants"),
      ConversationModel.countDocuments(filter),
    ]);

    const data = conversation.map((conversation) => {
      const other = (
        conversation.participants as unknown as Array<{
          _id: { toString(): string };
        }>
      ).find((participants) => {
        participants._id.toString() !== req.user!._id.toString();
      });

      return {
        _id: conversation._id,
        user: other,
        lastMessage: conversation.lastMessage,
        lastMessageAt: conversation.lastMessageAt,
        isOnline: other ? isUserOnline(other._id.toString()) : false,
      };
    });

    return res.status(200).json({
      message: "Success",
      data: {
        conversation: data,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  };

  getMessage = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req.params as { userId: string };
    const { page, limit } = req.query as unknown as {
      page: number;
      limit: number;
    };

    const skip = (page - 1) * limit;
    const conversation = await ConversationModel.findOne({
      participants: { $all: [req.user!._id, userId] },
    });

    if (!conversation) {
      return res.status(200).json({
        message: "Success",
        data: {
          messages: [],
          pagination: { page, limit, total: 0, pages: 0 },
        },
      });
    }

    const filter = { conversationId: conversation._id };
    const [messages, total] = await Promise.all([
      MessageModel.find(filter)
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("participants"),
      MessageModel.countDocuments(filter),
    ]);
    return res.status(200).json({
      message: "Success",
      data: {
        conversation: conversation._id,
        messages: messages,
        pagination: { page, limit, total: 0, pages: 0 },
      },
    });
  };
}

export default new ChatSevicre();
