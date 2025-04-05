import { NextFunction, Request, Response } from "express";
import { ZodSchema, ZodError } from "zod";
import { sendResponse } from "../lib/helper.function";

export const zodValidator = (schema: ZodSchema<any>) => (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const formattedErrors = result.error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));

    console.error("Zod Validation Error:", formattedErrors);

    sendResponse(res, 411, false, "Input Validation Error", null, formattedErrors);
    return;
  }

  // Replace body with validated & parsed data
  req.body = result.data;
  next();
};
