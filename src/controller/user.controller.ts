import bcryptjs from 'bcryptjs';
import { NextFunction, Request, Response } from "express";
import User from '../models/user.model';
import { ApiResponse} from './../dto/response.dto';
import { createUserInput } from '../dto/user.dto';
import { sendResponse } from '../lib/helper.function';

export const registerUser = async (req: Request, res : Response, next : NextFunction) : Promise<void> => {
    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if(existingUser) {
            sendResponse(res, 200, true, "User already exists", existingUser);
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