import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../lib/helper.function";
import * as jwt from "jsonwebtoken";

declare module "express" {
  export interface Request {
    userId?: string;
  }
}

/**
 * Middleware to authenticate a user based on a refresh token stored in cookies.
 *
 * @param req - The incoming HTTP request object.
 * @param res - The outgoing HTTP response object.
 * @param next - The next middleware function in the stack.
 *
 * @throws Will pass an error to the next middleware if token verification fails.
 *
 * @remarks
 * - If the `refresh-token` cookie is not present, a 401 Unauthorized response is sent.
 * - If the token is valid, the decoded user's ID is attached to `req.body.userId`.
 * - The middleware relies on the `REFRESH_TOKEN_SECRET` environment variable for token verification.
 */
export const AuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader =
      req.headers["authorization"] || req.headers["Authorization"];
    const headerToken =
      typeof authHeader === "string" && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : undefined;

    if (!headerToken) {
      sendResponse(res, 401, false, "Unauthorized", null);
      return;
    }
    const decodedUser = jwt.verify(
      headerToken,
      process.env.JWT_SECRET as string
    ) as { _id: string };
    req.userId = decodedUser._id;
    next();
    return;
  } catch (error) {
    next(error);
  }
};
