import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

export const zodValidator = (schema : ZodSchema<any>)=>(req : Request,res : Response, next : NextFunction) : void => {
    const result = schema.safeParse(req.body);

    if(!result.success) {
       res.status(411).send({success : false, message : 'Data Validation Error'});
       return;
    }
    req.body = result.data;
    next();

}