import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../lib/helper.function";
import Content from "../models/content.model";

/**
 * Adds new content to the database.
 *
 * @param req - The HTTP request object, containing the content details in the body.
 * @param res - The HTTP response object used to send the response back to the client.
 * @param next - The next middleware function in the Express.js request-response cycle.
 * 
 * @remarks
 * This function extracts the `link`, `type`, `title`, and `tags` from the request body,
 * along with the `userId` from the request object. It then attempts to create a new
 * content entry in the database. If the creation is successful, it sends a success
 * response with the created content. Otherwise, it sends an error response.
 * 
 * @throws Will pass any caught errors to the next middleware for error handling.
 * 
 * @returns A promise that resolves to void.
 */
export const addContent = async (req : Request, res : Response, next : NextFunction) : Promise<void> => {
    try {
        const { link, type, title, tags } = req.body;
        const userId = req.userId;
        
        //saving the content to the database
        const content = await Content.create({ link, type, title, tags, userId });

        if (!content) sendResponse(res, 400, false, "Content not created", null);

        sendResponse(res, 200, true, "Content created successfully", content);
        return;
    } catch (error) {
        next(error);
    }
}


/**
 * Retrieves all content associated with the authenticated user.
 *
 * @param req - The HTTP request object, which includes the `userId` of the authenticated user.
 * @param res - The HTTP response object used to send the response back to the client.
 * @param next - The next middleware function in the stack, used for error handling.
 * @returns A Promise that resolves to void. Sends a response containing the user's content and the total count.
 *
 * @throws Passes any errors to the next middleware for centralized error handling.
 *
 * The function performs the following steps:
 * 1. Extracts the `userId` from the request object.
 * 2. Fetches all content associated with the `userId` from the database, populating the `userId` field with the username.
 * 3. Counts the total number of content documents for the user.
 * 4. Sends a response with the content and count if content is found, or a "Content not found" message otherwise.
 */
export const getAllContent = async (req : Request, res : Response, next : NextFunction) : Promise<void> => {
    try {
        const userId = req.userId;

        const fetchAllContent = await Content.find({ userId }).populate("userId","username").sort({ createdAt: -1 });

        const contentCount = await Content.countDocuments({ userId });

        if(!fetchAllContent) sendResponse(res, 200, false, "Content not found", {count : contentCount, content : null});

        sendResponse(res, 200, true, "Content fetched successfully", {content : fetchAllContent, count : contentCount});
        return;

    } catch (error) {
        next(error);
    }
}

/**
 * Deletes a content item associated with the authenticated user.
 *
 * @param req - The HTTP request object, containing the user ID and content ID.
 * @param res - The HTTP response object used to send the response back to the client.
 * @param next - The next middleware function in the Express.js pipeline.
 * 
 * @returns A Promise that resolves to void.
 * 
 * @throws Passes any unexpected errors to the next middleware.
 * 
 * The function attempts to delete a content item from the database using the provided
 * content ID and user ID. If the deletion is successful, it sends a success response.
 * If the deletion fails, it logs the error and sends a failure response.
 */
export const deleteContent = async (req : Request, res : Response, next : NextFunction) : Promise<void> => {
    try {
        const userId = req.userId;
        const contentId = req.body.contentId;

        try {
            await Content.findByIdAndDelete({_id : contentId, userId});
        } catch (error) {
            console.error(error);
            sendResponse(res, 400, false, "Content not deleted", null);
            return;
        }
        

        sendResponse(res, 200, true, "Content deleted successfully", null);
        return;
    } catch (error) {
        next(error);
    }
}