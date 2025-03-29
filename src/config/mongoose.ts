import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';

dotenv.config();

mongoose.connect(process.env.MONGO_URI as string)

const db = mongoose.connection;

db.on('error', console.error.bind(console, colors.red('Error in connecting with the Database')));

db.once('open', () => {
    console.log(colors.bgYellow('Connected to the Database'));
});

export default db;