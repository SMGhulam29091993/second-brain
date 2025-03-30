import express from 'express';
import userRoutes from './user.routes';
const routes = express.Router();


routes.get('/', (req,res):any=>{
    return res.status(200).send({message : 'Welcome to the Second Brain API', success : true});
});

routes.use('/user', userRoutes );

export default routes;