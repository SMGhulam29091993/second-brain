import express from "express";
import { zodValidator } from "../../../middleware/zodValidate.middleware";
import { createLinkSchema } from "../../../dto/link.dto";
import {
  createBrainLink,
  createLink,
  createSummaryLink,
  getBrainLink,
  getSummaryLink,
} from "../../../controller/link.controller";
import { AuthMiddleware } from "../../../middleware/auth.middleware";

const routes = express.Router();

routes.post(
  "/create-link/:contentId",
  zodValidator(createLinkSchema),
  AuthMiddleware,
  createLink
);
routes.post("/brain-link", AuthMiddleware, createBrainLink);
routes.get("/brain/:hash", getBrainLink);
routes.post("/summary-link/:contentId", AuthMiddleware, createSummaryLink);
routes.get("/summary/:hash", getSummaryLink);

export default routes;
