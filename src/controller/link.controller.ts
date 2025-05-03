import { NextFunction, Request, Response } from "express";
import { nanoid } from 'nanoid';
import { createLinkInput } from "../dto/link.dto";
import { sendResponse } from '../lib/helper.function';
import Link from "../models/link.model";

/**
 * Creates a new link associated with a specific content ID and user ID.
 * 
 * @param req - The HTTP request object, which should contain the `contentId` in the route parameters
 *              and the `userId` in the authenticated user context.
 * @param res - The HTTP response object used to send the response back to the client.
 * @param next - The next middleware function in the Express.js request-response cycle.
 * 
 * @throws Will throw an error if the `userId` is undefined.
 * 
 * @remarks
 * - If the `contentId` is not provided in the request parameters, a 400 response is sent with an error message.
 * - A unique hash is generated using `nanoid` to identify the link.
 * - The link is created in the database using the `Link.create` method.
 * - If the link creation fails, a 400 response is sent with an error message.
 * - On successful creation, a 201 response is sent with the created link data.
 * 
 * @returns A void promise that resolves after the response is sent or an error is passed to the next middleware.
 */
export const createLink = async (req : Request, res : Response, next : NextFunction) : Promise<void> => {
    try {
        const contentId = req.params.contentId;
        if(!contentId) {
            sendResponse(res, 400, false, "Content ID is required", null);
            return;
        }

        const userId = req.userId as string;
        if (!userId) {
            throw new Error("User ID is undefined");
        }

        const hash = nanoid(10);

        const createLink : createLinkInput = {
            hash,
            userId,
            contentId
        }
        const link = await Link.create(createLink);

        if(!link){
            sendResponse(res, 400, false, "Link not created", null);
            return;
        }
        sendResponse(res, 201, true, "Link created successfully", link);
        return;
    } catch (error) {
        next(error);
    }
}