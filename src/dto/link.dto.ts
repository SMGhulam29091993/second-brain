import {z} from "zod";
import User from "../models/user.model";

export const createLinkSchema = z.object({
    hash : z.string().min(7, "Hash is required"),
    userId : z.string().refine(async (userId)=>{
        const user = await User.findById(userId);
        return user !== null;
    },
    {
        message: "User not found",
    }),
});

export type createLinkInput = z.infer<typeof createLinkSchema>;

export const linkDto = z.object({
    hash : z.string().min(7, "Hash is required"),
    userId : z.string().refine(async (userId)=>{
        const user = await User.findById(userId);
        return user !== null;
    }
    , { 
        message: "User not found",
    }),
    createdAt : z.date().optional(),
    updatedAt : z.date().optional(),
    _id : z.string().optional(),
    __v : z.number().optional(),
});

export type linkDtoType = z.infer<typeof linkDto>;
