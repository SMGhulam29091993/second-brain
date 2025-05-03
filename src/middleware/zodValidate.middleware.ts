import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { sendResponse } from "../lib/helper.function";

/**
 * Middleware function to validate the request body using a Zod schema.
 *
 * @param schema - A Zod schema used to validate the request body.
 * @returns A middleware function that validates the request body and either
 *          proceeds to the next middleware or sends a validation error response.
 *
 * @remarks
 * - If the validation fails, the middleware sends a response with a 411 status code,
 *   an error message, and the list of validation errors.
 * - If the validation succeeds, the request body is replaced with the validated
 *   and parsed data.
 *
 * @example
 * ```typescript
 * import { z } from "zod";
 * import { zodValidator } from "./zodValidate.middleware";
 *
 * const schema = z.object({
 *   name: z.string(),
 *   age: z.number(),
 * });
 *
 * app.post("/example", zodValidator(schema), (req, res) => {
 *   res.send("Validation passed!");
 * });
 * ```
 */
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
