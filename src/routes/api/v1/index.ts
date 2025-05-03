import express, { Request, Response } from 'express';
import userRoutes from './user.routes';
import contentRoutes from './content.routes';
import { sendResponse } from '../../../lib/helper.function';
import linkRoutes from './link.routes';
const routes = express.Router();


routes.get('/', (req : Request,res : Response):any=>{
    return sendResponse(res, 200, true, "Welcome to the API", null);
});

routes.use('/user', userRoutes );
routes.use('/content', contentRoutes );
routes.use('/link', linkRoutes)

export default routes;