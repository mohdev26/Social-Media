import { HydratedDocument, model, Model, Schema, Types } from "mongoose";

export interface IComment {
  _id: Types.ObjectId;
  postId: Types.ObjectId;
  parentId?: Types.ObjectId;
  content?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt?: Date;
}

export const commentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      minlength: 2,
      maxlength: 50000,
      required: true,
    },
    postId: { type: Schema.Types.ObjectId, ref: "post", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "user", required: true },
    parentId: { type: Schema.Types.ObjectId, ref: "comment" },
  },

  { timestamps: true },
);
commentSchema.index({ postId: 1, createdAt: -1 });
export const CommentModel: Model<IComment> = model<IComment>(
  "Comment",
  commentSchema,
);
export type HCommentDocument = HydratedDocument<IComment>;
