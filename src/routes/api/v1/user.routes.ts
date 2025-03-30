import express from 'express';
import { zodValidator } from '../../../middleware/zodValidate.middleware';
import { registerUser } from '../../../controller/user.controller';
import { createUserSchema } from '../../../dto/user.dto';

const routes = express.Router();


routes.post('/register', zodValidator(createUserSchema), registerUser);

export default routes;