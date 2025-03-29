import express from 'express';

const routes = express.Router();


routes.get('/', (req,res):any=>{
    return res.status(200).send({message : 'Welcome to the Second Brain API', success : true});
});



export default routes;