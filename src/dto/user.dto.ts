import { z } from "zod";

export const createUserSchema = z.object({
    username : z.string().min(3, "Username must be at least 3 characters long"),
    email : z.string().email("Invalid email address"),
    password : z.string().min(6, "Password must be at least 6 or more characters long"),
    isEmailverified : z.boolean().default(false),
})

export type createUserInput = z.infer<typeof createUserSchema>;