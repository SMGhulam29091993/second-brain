import express, { Request, Response } from 'express';
import userRoutes from './user.routes';
import { sendResponse } from '../../../lib/helper.function';
const routes = express.Router();


routes.get('/', (req : Request,res : Response):any=>{
    return sendResponse(res, 200, true, "Welcome to the API", null);
});

routes.use('/user', userRoutes );

export default routes;