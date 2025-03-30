import { Response } from "express";

export interface ApiResponse<T = any> {
    statusCode: number;
    success: boolean;
    message: string;
    data: T | null;
}

