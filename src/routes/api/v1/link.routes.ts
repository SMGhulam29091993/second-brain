import express from 'express';
import { zodValidator } from '../../../middleware/zodValidate.middleware';
import { createLinkSchema } from '../../../dto/link.dto';
import { createBrainLink, createLink } from '../../../controller/link.controller';
import { AuthMiddleware } from '../../../middleware/auth.middleware';

const routes = express.Router();

routes.post('/create-link/:contentId', zodValidator(createLinkSchema), AuthMiddleware ,createLink);
routes.post('/brain-link', zodValidator(createLinkSchema), AuthMiddleware ,createBrainLink);

export default routes;