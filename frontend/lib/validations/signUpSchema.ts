import { z } from "zod";

export const SignUpSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required",
  }),
  surname: z.string().min(1, {
    message: "Surname is required",
  }),
  email: z.string().email().min(1, {
    message: "Email is required",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
  confirmPassword: z.string().min(1, {
    message: "Confirm your password",
  }),
  phone: z.string().min(1, {
    message: "Phone number is required",
  }),
});

export type SignUpValues = z.infer<typeof SignUpSchema>;
