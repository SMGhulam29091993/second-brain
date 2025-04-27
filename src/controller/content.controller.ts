import { NextFunction, Request, Response } from "express";
import Content from "../models/content.model";
import { sendResponse } from "../lib/helper.function";

export const addContent = async (req : Request, res : Response, next : NextFunction) : Promise<void> => {
    try {
        const { link, type, title, tags } = req.body;
        const userId = req.userId;

        //saving the content to the database
        const content = await Content.create({ link, type, title, tags, userId });

        if (!content) sendResponse(res, 400, false, "Content not created", null);

        sendResponse(res, 200, true, "Content created successfully", content);

    } catch (error) {
        next(error);
    }
}