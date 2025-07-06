import { Response } from "express";
import { ApiResponse } from "../dto/response.dto";
import { error } from "winston";

/**
 * Sends a standardized API response to the client.
 *
 * @template T - The type of the data being sent in the response.
 * @param res - The Express `Response` object used to send the response.
 * @param statusCode - The HTTP status code for the response.
 * @param success - A boolean indicating whether the operation was successful.
 * @param message - A message describing the result of the operation.
 * @param data - Optional data to include in the response body. Defaults to `null` if not provided.
 * @returns The Express `Response` object with the JSON response.
 */
export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data?: T | null,
  error?: T | null
): Response => {
  const response: ApiResponse<T> = {
    statusCode,
    success,
    message,
    data: data ?? null, // Ensures `null` if data is undefined or missing
    error: error ?? null, // Ensures `null` if error is undefined or missing
  };
  return res.status(statusCode).json(response);
};

/**
 * Generates a random 6-character alphanumeric email verification code.
 *
 * @returns {string} A randomly generated string consisting of uppercase letters,
 * lowercase letters, and digits.
 */
export const generateVerifiactionCode = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
};

/**
 * Capitalizes the first letter of each word in a given string.
 *
 * @param input - The input string to be transformed.
 * @returns A new string with the first letter of each word capitalized.
 *
 * @example
 * ```typescript
 * const result = capitalizeFirstLetter("hello world");
 * console.log(result); // Output: "Hello World"
 * ```
 */
export const capitalizeFirstLetter = (input: string) => {
  return input
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
