import * as colors from 'colors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import db from './config/mongoose';
import { errorHandlerMiddleware } from './middleware/errorHandler';
import routes from './routes/api/v1/index';

dotenv.config();

const app = express();
const PORT = 3001
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