import { z } from "zod";

export const sourceSchema = z.object({
  name: z.string().min(3, "Name is required"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  _id: z.string().optional(),
  __v: z.number().optional(),
});

export type sourceDto = z.infer<typeof sourceSchema>;
