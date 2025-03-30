import { Response } from "express";
import { ApiResponse } from "../dto/response.dto";

export const sendResponse = <T>(
    res: Response, 
    statusCode: number, 
    success: boolean, 
    message: string, 
    data?: T
): Response => {
    const response: ApiResponse<T> = {
        statusCode,
        success,
        message,
        data: data ?? null, // Ensures `null` if data is undefined or missing
    };
    return res.status(statusCode).json(response);
};