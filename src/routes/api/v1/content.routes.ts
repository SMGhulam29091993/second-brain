import express from 'express';
import { zodValidator } from '../../../middleware/zodValidate.middleware';
import { addContent } from '../../../controller/content.controller';
import { AuthMiddleware } from '../../../middleware/auth.middleware';
import { createContentSchema } from '../../../dto/content.dto';

const routes = express.Router();

routes.post('/add-content', zodValidator(createContentSchema), AuthMiddleware ,addContent);
