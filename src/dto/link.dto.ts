import {z} from "zod";
import User from "../models/user.model";
import Content from "../models/content.model";

export const createLinkSchema = z.object({
    hash : z.string().min(7, "Hash is required"),
    userId : z.string().refine(async (userId)=>{
        const user = await User.findById(userId);
        return user !== null;
    },
    {
        message: "User not found",
    }),
    contentId : z.string().refine(async (contentId)=>{
        const content = await Content.findById(contentId);
        return content !== null;
    }
    , {
        message: "Content not found",
    }).optional(),
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
    contentId : z.string().refine(async (contentId)=>{
        const content = await Content.findById(contentId);
        return content !== null;
    }
    , {
        message: "Content not found",
    }).optional(),
    createdAt : z.date().optional(),
    updatedAt : z.date().optional(),
    _id : z.string().optional(),
    __v : z.number().optional(),
});

export type linkDtoType = z.infer<typeof linkDto>;
