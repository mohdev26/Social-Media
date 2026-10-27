import { HydratedDocument, model, Model, Schema, Types } from "mongoose";
import { string } from "zod";

export interface IConversation {
  _id: Types.ObjectId;
  participants: Types.ObjectId[];

  lastMessage?: string;
  lastMessageAt?: Date;
  lastMessageBy?: Types.ObjectId;

  createdAt: Date;
  updatedAt?: Date;
}

export const ConversationSchema = new Schema<IConversation>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        requried: true,
      },
    ],
    lastMessage: { type: string },
    lastMessageAt: { type: Date },
    lastMessageBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export const ConversationModel: Model<IConversation> = model<IConversation>(
  "Conversation",
  ConversationSchema,
);
export type HConversationDocument = HydratedDocument<IConversation>;
