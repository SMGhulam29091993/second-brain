import bcryptjs from 'bcryptjs';
import { config } from 'dotenv';
import { NextFunction, Request, Response } from "express";
import { createUserInput } from '../dto/user.dto';
import { generateVerifiactionCode, sendResponse } from '../lib/helper.function';
import { sendMail } from '../lib/nodemailer';
import User from '../models/user.model';
import { createToken, validateToken } from '../utils/features';
import { UserDto } from '../constants/types';

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


/**
 * Handles the creation of a user session by authenticating the user and generating a token.
 * 
 * @param req - The HTTP request object containing user credentials in the body.
 * @param res - The HTTP response object used to send responses back to the client.
 * @param next - The next middleware function in the Express.js request-response cycle.
 * 
 * @returns A Promise that resolves to void. Sends appropriate HTTP responses based on the authentication process.
 * 
 * @throws Passes any unexpected errors to the next middleware for error handling.
 * 
 * Functionality:
 * - Fetches the user from the database using the provided email.
 * - Verifies the user's password using bcryptjs.
 * - If the email is not verified, sends a verification email with a code and hash.
 * - If authentication is successful, generates a token and sends it in the response.
 * - Excludes the password from the user object in the response.
 */
export const createSession = async (req : Request, res : Response, next : NextFunction) : Promise<void> => {
    try {
        const fetchUser = await User.findOne({ email: req.body.email }).select("+password");
        if(!fetchUser) {
            sendResponse(res, 404, false, "User not found", null);
            return;
        }
        const isValidPassword = await bcryptjs.compare(req.body.password, fetchUser.password);
        if(!isValidPassword) {
            sendResponse(res, 403, false, "Invalid Credentials", null);
            return;
        }

        if(isValidPassword && !fetchUser.isEmailVerified) {

            const verificationHash = await bcryptjs.hash(fetchUser.email, 10);
            const code = await generateVerifiactionCode(); // Generate a random verification code

            await sendMail(fetchUser.email, String(process.env.SMTP_USER), "Email Verification Code", `<h1>Welcome ${fetchUser.username}</h1><p>Please verify your email with the given code : ${code} "</p>`);
            sendResponse(res, 200, true, "User Email not verified", verificationHash);
            return;
        }
        const { password, ...user } = fetchUser.toObject(); // Exclude password from the response

        const userData : UserDto={
            _id : user._id.toString(),
            username : user.username,
            email : user.email,
            isEmailVerified : user.isEmailVerified
        }
        await createToken(res, userData, "Login successful");
        return;
    } catch (error) {
        next(error)        
    }
}

/**
 * Handles the refresh token functionality for user authentication.
 * 
 * @param req - The HTTP request object, which contains the cookies with the refresh token.
 * @param res - The HTTP response object, used to send the response back to the client.
 * @param next - The next middleware function in the Express.js request-response cycle.
 * 
 * @returns A Promise that resolves to void. Sends a response to the client with the refreshed token or an error message.
 * 
 * @throws Passes any unexpected errors to the next middleware for error handling.
 * 
 * The function performs the following steps:
 * 1. Extracts the refresh token from the request cookies.
 * 2. Validates the token and retrieves the associated user data.
 * 3. Checks if the user exists in the database.
 * 4. Constructs a `UserDto` object with the user's details.
 * 5. Creates a new token and sends it back to the client.
 * 6. Handles errors by passing them to the next middleware.
 */
export const refreshToken = async (req: Request, res : Response, next : NextFunction) : Promise<void>=>{
    try {
        const token = req.cookies['refresh-token'];
        if(!token) {
            sendResponse(res, 403, false, "Unauthorized Action/token", null);
            return;
        }
        const data = await validateToken(token);
        const userData = await User.findById({_id : data})
        if(!userData) {
            sendResponse(res, 403, false, "Unauthorized Action/token", null);
            return;
        }
        const user : UserDto = {
            _id : userData._id.toString(),
            username : userData.username,
            email : userData.email,
            isEmailVerified : userData.isEmailVerified
        }
        await createToken(res, user, "Token refreshed successfully");
        return;
    } catch (error) {
        next(error);
    }
}

export const verifyEmail = async (req : Request, res : Response, next : NextFunction) : Promise<void> => {
    try {
        
    } catch (error) {
        console.error(error);
        next(error);
    }
}