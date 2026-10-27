import { HydratedDocument, model, Model, Schema, Types } from "mongoose";

export interface IMessage {
  _id: Types.ObjectId;
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  recivierId: Types.ObjectId;
  content?: string;
  readAt: DataTransfer;
  createdAt: Date;
  updatedAt?: Date;
}

export const messageSchema = new Schema<IMessage>(
  {
    content: {
      type: String,
      minlength: 1,
      maxlength: 50000,
      required: true,
      trim: true,
    },
    senderId: { type: Schema.Types.ObjectId, ref: "user", required: true },
    recivierId: { type: Schema.Types.ObjectId, ref: "user", required: true },
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    readAt: { type: Date },
  },

  { timestamps: true },
);
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ recivierId: 1, readAt: -1 });

messageSchema.pre("validate", async function () {
  if (this.content) this.content = this.content?.trim();
});

export const MessageModel: Model<IMessage> = model<IMessage>(
  "Comment",
  messageSchema,
);
export type HCommentDocument = HydratedDocument<IMessage>;
