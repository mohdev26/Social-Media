import { z } from "zod";

export const logInSchema = {
  body: z.strictObject({
    email: z.email(),
    password: z
    .string() 
    .min(8, { error: "Password must be at least 8 characters long" })
    .max(64, { error: "Password must be at most 64 characters long" }),
  }),
};

export const confirmEmailSchema = {
  body: z.strictObject({
    email: z.email(),
    otp: z.string().regex(/^\d{6}$/),
      }),
};

export const signUpSchema = {
  body: logInSchema.body
  .extend({
    username: z
      .string({ error: "Username must be required" })
      .min(2, { error: "Username must be at least 2 characters long" })
      .max(25, { error: "Username must be at most 25 characters long" }),   
    confirmPassword: z
      .string({ error: "confirmPassword must be required" })
      .min(8, { 
        error: "confirmPassword must be at least 8 characters long" })
      .max(64, { 
        error: "confirmPassword must be at most 64 characters long" }),
      })
    .superRefine((data, ctx) => {
    if (data.confirmPassword !== data.password) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  }),
};
