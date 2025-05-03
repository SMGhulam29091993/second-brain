import * as colors from 'colors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import db from './config/mongoose';
import { errorHandlerMiddleware } from './middleware/errorHandler';
import routes from './routes/api/v1/index';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = 3001
db; // Initialize the database connection


const allowedOrigins = ['http://localhost:5173', process.env.FRONTEND_URL];
const corsOptions = {
    origin : (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        if(allowedOrigins.indexOf(origin) !== -1 || !origin){
            callback(null,true);
        }else{
            callback(new Error("Not allowed by CORS"))
        }
    }
}
app.use(cors(corsOptions));

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