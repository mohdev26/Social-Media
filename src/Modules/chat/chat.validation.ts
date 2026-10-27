import { z } from "zod";

export const sendMessageSchema = z.object({
  to: z.string().regex(/^[0-9a-fA-F]{24}$/, { error: "Invalid id format" }),
  content: z
    .string({ error: "Message conetnt is requried" })
    .trim()
    .min(1)
    .max(50000),
});

export const typingSchema = z.object({
  to: z.string().regex(/^[0-9a-fA-F]{24}$/, { error: "Invalid id format" }),
});

export const emptySchema = z.unknown();

export const conversationSchema = {
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  }),
};

export const getMessageSchema = {
  params: z.strictObject({
    userId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, { error: "Invalid id format" }),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  }),
};
