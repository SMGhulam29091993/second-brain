import bcryptjs from 'bcryptjs';
import { NextFunction, Request, Response } from "express";
import User from '../models/user.model';
import { ApiResponse} from './../dto/response.dto';
import { createUserInput } from '../dto/user.dto';
import { generateVerifiactionCode, sendResponse } from '../lib/helper.function';
import { sendMail } from '../lib/nodemailer';
import { config } from 'dotenv';

config();


/**
 * Registers a new user in the system.
 *
 * @param req - The HTTP request object containing user registration details.
 * @param res - The HTTP response object used to send responses to the client.
 * @param next - The next middleware function in the Express.js request-response cycle.
 * 
 * @remarks
 * - Checks if a user with the provided email already exists. If so, responds with a 403 status.
 * - Hashes the user's password before saving it to the database.
 * - Creates a new user in the database with the provided details.
 * - Excludes the password from the response object for security reasons.
 * - If the user's email is not verified, generates a verification hash.
 * - Sends an email verification code to the user's email address.
 * - Responds with a 201 status if the user is successfully created.
 * - If user creation fails, responds with a 400 status.
 * - Passes any errors to the next middleware function.
 * 
 * @throws Will pass any unexpected errors to the next middleware.
 */
export const registerUser = async (req: Request, res : Response, next : NextFunction) : Promise<void> => {
    try {

        let verificationHash: string | null = null;
        
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
        
        if(!user.isEmailVerified){
            verificationHash = await bcryptjs.hash(user.email, 10);
        }
        
        if(!registerUser) {
            sendResponse(res, 400, false, "User not created", null);
            return;
        }

        let code = await generateVerifiactionCode(); // Generate a random verification code

        await sendMail(user.email, String(process.env.SMTP_USER), "Email Verification Code", `<h1>Welcome ${user.username}</h1><p>Please verify your email with the given code : ${code} "</p>`);
        sendResponse(res, 201, true, "User created successfully", verificationHash);
        return;
    } catch (error) {
        next(error)
    }

}