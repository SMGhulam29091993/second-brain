import express from 'express';
import * as colors from 'colors';
import dotenv from 'dotenv';
import db from './config/mongoose';
import * as cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import routes from './routes/api/v1/index';
import { errorHandlerMiddleware } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = 3000;
db; // Initialize the database connection


app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(cookieParser());


app.use(errorHandlerMiddleware);

app.use('/', routes);

app.listen(PORT,(err)=>{
    if(err){
        return console.error(err);
    }
    return console.log(colors.bgGreen(`Server is listening on ${PORT} in ${process.env.NODE_ENV?.trim()} mode...`));
})