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

    const hash = generateHash(10);

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
export const generateHash = (length: number = 10): string => {
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

    const shareBrain = req.body.shareBrain as boolean;

    if (shareBrain) {
      const existLink = await Link.findOne({
        userId,
        contentId: { $exists: false },
      });

      const baseUrl = process.env.FRONTEND_BASE_URL as string;

      if (existLink) {
        const link = `${baseUrl}/brain/${existLink.hash}`;
        sendResponse(res, 200, true, "Here is your link", { link });
        return;
      }

      console.log("No existing link found, generating a new one...");

      // Using built-in crypto instead of nanoid
      const hash = generateHash(20);

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

    const pageNumber = parseInt(req.query?.pageNumber as string) || 1;
    const pageSize = parseInt(req.query?.pageSize as string) || 10;

    const skip = (pageNumber - 1) * pageSize;
    const limit = pageSize;

    const filter = req.query?.source
      ? { userId: link.userId._id, source: req.query.source }
      : { userId: link.userId._id };

    const content = await Content.find(filter)
      .populate("userId", "username")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const contentCount = await Content.countDocuments(filter);

    if (!content) {
      sendResponse(res, 411, false, "No Content To Show", {
        count: contentCount,
        content: null,
      });
      return;
    }

    sendResponse(res, 200, true, "Here is your content", {
      username: link.userId.username,
      content,
      count: contentCount,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const createSummaryLink = async (
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
    const existingLink = await Link.findOne({
      contentId,
      userId: req.userId,
    });
    if (existingLink) {
      sendResponse(res, 200, true, "Link already exists", {
        link: `${process.env.FRONTEND_BASE_URL}/shared-summary/${existingLink.hash}`,
      });
      return;
    }
    const userId = req.userId as string;
    if (!userId) {
      throw new Error("User ID is undefined");
    }

    const hash = generateHash(10);

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

    const baseUrl = process.env.FRONTEND_BASE_URL as string;
    const summaryLinkUrl = `${baseUrl}/shared-summary/${link.hash}`;

    sendResponse(res, 201, true, "Summary link created successfully", {
      link: summaryLinkUrl,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getSummaryLink = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const hash = req.params.hash as string;
    const link = await Link.findOne({ hash });

    if (!link) {
      sendResponse(res, 411, false, "Sorry Wrong Url!!!", null);
      return;
    }

    if (!link.contentId) {
      sendResponse(
        res,
        411,
        false,
        "This link does not point to a summary",
        null
      );
      return;
    }

    const content = await Content.findById(link.contentId);

    if (!content) {
      sendResponse(res, 411, false, "No Content To Show", null);
      return;
    }

    sendResponse(res, 200, true, "Here is your summary", {
      summary: content.summary,
      title: content.title,
      link: content.link,
      contentId: content._id,
      userId: content.userId,
      createdAt: content.createdAt,
      source: content.source,
      type: content.type,
      tags: content.tags,
    });
    return;
  } catch (error) {
    next(error);
  }
};
