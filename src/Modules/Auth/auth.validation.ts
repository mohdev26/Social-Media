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

export const signUpSchema = {
  body: logInSchema.body.extend({
    body: z.strictObject({
    username: z
      .string({ error: "Username must be required" })
      .min(2, { error: "Username must be at least 2 characters long" })
      .max(25, { error: "Username must be at most 25 characters long" }),   
    confirmPassword: z
      .string({ error: "confirmPassword must be required" })
      .min(8, { error: "confirmPassword must be at least 8 characters long" })
      .max(64, { error: "confirmPassword must be at most 64 characters long" }),
      otp: z.string().regex(/^\d{6}$/),
      role: z.enum(["user", "admin"]).default("user"),
      gender: z.enum(["male", "female"]).default("female")
    }),
  }).superRefine((data, ctx) => {
    if (data.body.confirmPassword !== data.password) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match",
      
      });
    }
  }),
};
