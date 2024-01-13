import { z } from "zod";

export const SignInSchema = z.object({
  email: z.string().email().min(1, {
    message: "Email is required",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
});

export type SignInValues = z.infer<typeof SignInSchema>;
