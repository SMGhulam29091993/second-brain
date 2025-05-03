import express from 'express';
import { zodValidator } from '../../../middleware/zodValidate.middleware';
import { createLinkSchema } from '../../../dto/link.dto';
import { createLink } from '../../../controller/link.controller';
import { AuthMiddleware } from '../../../middleware/auth.middleware';

const routes = express.Router();

routes.post('/create-link/:contentId', zodValidator(createLinkSchema), AuthMiddleware ,createLink);

export default routes;