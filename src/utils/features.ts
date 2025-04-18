import { Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { createUserInput } from './../dto/user.dto';
import { UserDto } from '../constants/types';

/**
 * Generates and sends a JWT token and refresh token to the client.
 * 
 * @param res - The HTTP response object used to send the tokens and response data.
 * @param user - A partial object of the user containing at least the email property.
 * @param check - A string message to include in the response.
 * 
 * This function creates a JWT token and a refresh token using the user's email and 
 * environment-specific secrets. The refresh token is set as an HTTP-only cookie with 
 * appropriate security settings based on the environment (production or development). 
 * The function then sends a response containing the user data, the JWT token, and a 
 * success message.
 */
export const  createToken = (res : Response, user : Partial<UserDto>, check : string) : void=>{
    const token = jwt.sign({_id : user._id}, String(process.env.JWT_SECRET), {expiresIn : "1h"});
    const refreshToken = jwt.sign({_id : user._id}, String(process.env.JWT_REFRESH_SECRET), {expiresIn : "7d"});
    
    res.status(200)
        .cookie("refresh-token", refreshToken,
            {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production'? true : false,
                sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
                maxAge : 1000 * 60 * 60 * 24 * 7
            })
        .send({statusCode : 200, success: true, message : check, data : {user, token}});
    return;
}

/**
 * Validates a given refresh token and extracts the email address if valid.
 *
 * @param refreshToken - The refresh token to validate.
 * @returns The email address extracted from the token if valid, or `null` if the token is invalid.
 *
 * @throws Will throw an error if the token verification fails due to an invalid secret or malformed token.
 */
export const validateToken = (refreshToken : string) =>{
    const isValideRefreshToken = jwt.verify(refreshToken, String(process.env.JWT_REFRESH_SECRET));
    if(!isValideRefreshToken) {
        return null;
    }

    const userId = jwt.decode(refreshToken) as {_id : string};
    return userId._id;
}