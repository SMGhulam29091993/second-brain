import express from 'express';
import { zodValidator } from '../../../middleware/zodValidate.middleware';
import { createSession, registerUser } from '../../../controller/user.controller';
import { createUserSchema, userLoginSchema } from '../../../dto/user.dto';

const routes = express.Router();


routes.post('/register', zodValidator(createUserSchema), registerUser);
routes.post('/login', zodValidator(userLoginSchema), createSession);

export default routes;