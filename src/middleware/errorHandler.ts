
export const errorHandlerMiddleware = (err: any, req: any, res: any, next: any) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    if(err.code === 11000){
        const error = Object.keys(err.keyValue).map((key) => `${key}: ${err.keyValue[key]}`);
        message = `Duplicate key error: ${error.join(', ')}`;
        statusCode = 400;
    }

    if(err.name === 'CastError'){
        message = `Invalid format: ${err.path}`;
        statusCode = 400;
    }

    return res.status(statusCode).send({
        success: false,
        message: process.env.NODE_ENV==='DEVELOPMENT'?err : message,})
}
