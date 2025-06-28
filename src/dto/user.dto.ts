import { z } from "zod";

// registration dto
export const createUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 or more characters long"),
  isEmailVerified: z.boolean().default(false),
});

export type createUserInput = z.infer<typeof createUserSchema>;

//login dto
export const userLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 or more characters long"),
});

export type userLoginInput = z.infer<typeof userLoginSchema>;

//user dto
export const userSchema = z.object({
  _id: z.string().optional(),
  username: z.string(),
  email: z.string().email("Invalid email address"),
  isEmailVerified: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  __v: z.number().optional(),
  password: z.string().optional(),
});

export type userDto = z.infer<typeof userSchema>;

//user reset password dto
export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type resetPasswordInput = z.infer<typeof resetPasswordSchema>;
