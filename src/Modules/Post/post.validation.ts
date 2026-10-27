import { z } from "zod";

export const createPostSchema = {
  body: z.strictObject({
    content: z.string().min(2).max(5000).optional(),
  }),
};

export const postIdParamsSchema = {
  params: z.strictObject({
    postId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, { error: "Invalid id format" }),
  }),
};
export const updatePostSchema = {
  params: z.strictObject({
    postId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, { error: "Invalid id format" }),
  }),
  body: z.strictObject({
    content: z.string().min(2).max(5000),
  }),
};

export const creatCommentSchema = {
  params: z.strictObject({
    postId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, { error: "Invalid id format" }),
  }),
  body: z.strictObject({
    content: z.string().min(2).max(5000),
    parentId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, { error: "Invalid id format" })
      .optional(),
  }),
};

export const updateCommentSchema = {
  params: z.strictObject({
    commentId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, { error: "Invalid id format" }),
  }),
  body: z.strictObject({
    content: z.string().min(2).max(5000),
  }),
};

export const CommentIdParamsSchema = {
  params: z.strictObject({
    commentId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, { error: "Invalid id format" }),
 
  }),
};
