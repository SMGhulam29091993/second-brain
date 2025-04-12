import { Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { createUserInput } from './../dto/user.dto';

export const createToken = (res : Response, user : Partial<createUserInput>, check : string) : void=>{
    const token = jwt.sign({email : user.email}, String(process.env.JWT_SECRET), {expiresIn : "1h"});
    const refreshToken = jwt.sign({email : user.email}, String(process.env.JWT_REFRESH_SECRET), {expiresIn : "7d"});
    
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

export const validateToken = (refreshToken : string) =>{
    const isValideRefreshToken = jwt.verify(refreshToken, String(process.env.JWT_REFRESH_SECRET));
    if(!isValideRefreshToken) {
        return null;
    }

    const email = jwt.decode(refreshToken) as {email : string};
    return email.email;
}