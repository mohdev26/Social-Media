 import { z } from "zod";
import { confirmEmailSchema, signUpSchema } from "./auth.validation";

export type ISignUpDTO = z.infer<typeof signUpSchema.body>;
export type IConfirmEmailDTO = z.infer<typeof confirmEmailSchema.body>;
export type ILoginDTO = z.infer<typeof signUpSchema.body>;



