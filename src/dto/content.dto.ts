import { z } from "zod";
import Tag from "../models/tag.model";
import User from "../models/user.model";


/// This DTO is used to validate the content data before it is saved to the database.
export const createContentSchema = z.object({
    link : z.string().url("Invalid URL"),
    type : z.enum(['video', 'image', 'audio', 'article']).refine(value => value !== undefined, {
        message: "Invalid content type",
    }),
    title : z.string().min(3, "Title is required"),
    tags : z.array(z.string().refine(async (tagId) => {
        const tag = await Tag.findById(tagId);
        return tag !== null;
        }, {
            message: "Tag not found",
        })),
    userId : z.string().refine(async (userId) => {
        const user = await User.findById(userId);
        return user !== null;
    }
    , {
        message: "User not found",
    }),
})
export type createContentInput = z.infer<typeof createContentSchema>;


//contentDto is used to validate the content data before sending it to the client
export const contentDto = z.object({
    link : z.string().url("Invalid URL"),
    type : z.enum(['video', 'image', 'audio', 'article']).refine(value => value !== undefined, {
        message: "Invalid content type",
    }),
    title : z.string().min(3, "Title is required"),
    tags : z.array(z.string().refine(async (tagId) => {
        const tag = await Tag.findById(tagId);
        return tag !== null;
        }, {
            message: "Tag not found",
        })),
    userId : z.string().refine(async (userId) => {
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

export type contentDtoType = z.infer<typeof contentDto>;