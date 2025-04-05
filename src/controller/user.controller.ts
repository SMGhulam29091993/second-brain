import bcryptjs from 'bcryptjs';
import { NextFunction, Request, Response } from "express";
import User from '../models/user.model';
import { ApiResponse} from './../dto/response.dto';
import { createUserInput } from '../dto/user.dto';
import { sendResponse } from '../lib/helper.function';

/**
 * Registers a new user in the system.
 *
 * @param req - The HTTP request object containing user registration details.
 * @param res - The HTTP response object used to send the response back to the client.
 * @param next - The next middleware function in the Express.js request-response cycle.
 * 
 * @remarks
 * - Checks if a user with the provided email already exists.
 * - Hashes the user's password before saving it to the database.
 * - Excludes the password from the response object.
 * - Sends appropriate responses based on the success or failure of the operation.
 * 
 * @throws Will pass any unexpected errors to the next middleware via `next(error)`.
 * 
 * @returns A `Promise<void>` indicating the completion of the operation.
 */
export const registerUser = async (req: Request, res : Response, next : NextFunction) : Promise<void> => {
    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if(existingUser) {
            sendResponse(res, 403, false, "User already exists", existingUser);
            return;
        }

        const hashPassword = await bcryptjs.hash(req.body.password, 10);
        const userData : createUserInput = {
            ...req.body,
            password: hashPassword,
        }
        const registerUser = await User.create(userData);

        const { password, ...user } = registerUser.toObject(); // Exclude password from the response
        
        if(!registerUser) {
            sendResponse(res, 400, false, "User not created", null);
            return;
        }
        sendResponse(res, 201, true, "User created successfully", user);
        return;
    } catch (error) {
        next(error)
    }

}