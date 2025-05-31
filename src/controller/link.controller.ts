import { NextFunction, Request, Response } from "express";
import { createLinkInput } from "../dto/link.dto";
import { userDto } from "../dto/user.dto";
import { sendResponse } from "../lib/helper.function";
import Content from "../models/content.model";
import Link from "../models/link.model";
import { randomBytes } from "crypto";

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
export const createLink = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const contentId = req.params.contentId;
    if (!contentId) {
      sendResponse(res, 400, false, "Content ID is required", null);
      return;
    }

    const userId = req.userId as string;
    if (!userId) {
      throw new Error("User ID is undefined");
    }

    const { nanoid } = await import("nanoid");
    const hash = nanoid(10);

    const createLink: createLinkInput = {
      hash,
      userId,
      contentId,
    };
    const link = await Link.create(createLink);

    if (!link) {
      sendResponse(res, 400, false, "Link not created", null);
      return;
    }
    sendResponse(res, 201, true, "Link created successfully", link);
    return;
  } catch (error) {
    next(error);
  }
};

// Helper function to generate random hash
const generateHash = (length: number = 10): string => {
  return randomBytes(Math.ceil((length * 3) / 4))
    .toString("base64")
    .slice(0, length)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
};

export const createBrainLink = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId as string;
    console.log("User ID:", userId);

    const shareBrain = req.body.shareBrain as boolean;
    console.log("Share Brain:", shareBrain);

    if (shareBrain) {
      console.log("Creating or retrieving brain link for user:", userId);

      const existLink = await Link.findOne({
        userId,
        contentId: { $exists: false },
      });
      console.log("Existing link:", existLink);

      const baseUrl = process.env.FRONTEND_BASE_URL as string;
      console.log("Base URL:", baseUrl);

      if (existLink) {
        console.log("Existing link found:", existLink);

        const link = `${baseUrl}/brain/${existLink.hash}`;
        sendResponse(res, 200, true, "Here is your link", { link });
        return;
      }

      console.log("No existing link found, generating a new one...");

      // Using built-in crypto instead of nanoid
      const hash = generateHash(20);
      console.log("Generated hash for new link:", hash);

      const createLink: createLinkInput = {
        hash,
        userId,
      };

      const link = await Link.create(createLink);
      if (!link) {
        sendResponse(res, 400, false, "Link not created", null);
        return;
      }

      const linkUrl = `${baseUrl}/brain/${link.hash}`;
      sendResponse(res, 201, true, "Link created successfully", {
        link: linkUrl,
      });
      return;
    } else {
      await Link.findOneAndDelete({ userId, contentId: { $exists: false } });
      sendResponse(res, 200, true, "Link deleted successfully", null);
      return;
    }
  } catch (error) {
    console.error("Error in createBrainLink:", error);
    next(error);
  }
};
/**
 * Retrieves a brain link based on the provided hash parameter in the request.
 *
 * @param req - The HTTP request object containing the hash parameter.
 * @param res - The HTTP response object used to send the response back to the client.
 * @param next - The next middleware function in the Express.js pipeline.
 *
 * @returns A Promise that resolves to void. Sends a response with the content or an error message.
 *
 * @throws Passes any unexpected errors to the next middleware.
 *
 * The function performs the following steps:
 * 1. Extracts the `hash` parameter from the request.
 * 2. Searches for a link in the database using the `hash` and populates the `userId` field with the username.
 * 3. If no link is found, sends a 411 response with an error message.
 * 4. Searches for content in the database using either the `contentId` or `userId` from the link.
 * 5. If no content is found, sends a 411 response with an error message.
 * 6. If content is found, sends a 200 response with the username and content.
 */
export const getBrainLink = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const hash = req.params.hash as string;
    const link = await Link.findOne({ hash }).populate<{ userId: userDto }>(
      "userId",
      "username"
    );
    if (!link) {
      sendResponse(res, 411, false, "Sorry Wrong Url!!!", null);
      return;
    }

    const content = await Content.findOne({
      $or: [{ _id: link.contentId }, { userId: link.userId }],
    });
    if (!content) {
      sendResponse(res, 411, false, "No Content To Show", null);
      return;
    }

    sendResponse(res, 200, true, "Here is your content", {
      username: link.userId.username,
      content,
    });
    return;
  } catch (error) {
    next(error);
  }
};
