import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../lib/helper.function";
import Content from "../models/content.model";
import { addContentSource } from "../services/content.service";
import Source from "../models/source.model";

/**
 * Adds new content to the database for the authenticated user.
 *
 * @param req - Express request object containing content details in the body.
 *   - `link`: The URL or reference link for the content (required).
 *   - `type`: The type/category of the content (required).
 *   - `title`: The title of the content (required).
 *   - `tags`: Optional array of tags associated with the content.
 *   - `source`: Optional source information for the content.
 *   - `userId`: The ID of the authenticated user (attached to the request).
 * @param res - Express response object used to send the API response.
 * @param next - Express next function for error handling.
 *
 * @returns A promise that resolves to void. Sends a JSON response indicating success or failure.
 *
 * @remarks
 * - Validates required fields (`link`, `type`, `title`).
 * - Optionally adds a new content source if provided.
 * - Saves the content to the database and returns the created content.
 * - Handles errors by passing them to the next middleware.
 */
export const addContent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { link, type, title, tags, source } = req.body;
    const userId = req.userId;

    if (!link || !type || !title) {
      sendResponse(res, 400, false, "Link, type and title are required", null);
      return;
    }
    if (source) {
      const existSource = await Source.findOne({ name: source });
      if (!existSource) {
        await addContentSource(source);
      }
    }

    //saving the content to the databaseO
    const content = await Content.create({
      link,
      type,
      title,
      tags: tags ?? [],
      userId,
      source,
    });

    if (!content) sendResponse(res, 400, false, "Content not created", null);

    sendResponse(res, 200, true, "Content created successfully", content);
    return;
  } catch (error) {
    next(error);
  }
};

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
export const getAllContent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId;

    const fetchAllContent = await Content.find({ userId })
      .populate("userId", "username")
      .sort({ createdAt: -1 });

    const contentCount = await Content.countDocuments({ userId });

    if (!fetchAllContent)
      sendResponse(res, 200, false, "Content not found", {
        count: contentCount,
        content: null,
      });

    sendResponse(res, 200, true, "Content fetched successfully", {
      content: fetchAllContent,
      count: contentCount,
    });
    return;
  } catch (error) {
    next(error);
  }
};

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
export const deleteContent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId;
    const contentId = req.body.contentId;

    try {
      await Content.findByIdAndDelete({ _id: contentId, userId });
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
};
