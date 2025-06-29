import express from "express";
import { zodValidator } from "../../../middleware/zodValidate.middleware";
import {
  addContent,
  deleteContent,
  getAllContent,
  getAllSources,
  getContentSummary,
} from "../../../controller/content.controller";
import { AuthMiddleware } from "../../../middleware/auth.middleware";
import { createContentSchema } from "../../../dto/content.dto";

const routes = express.Router();

routes.post(
  "/add-content",
  zodValidator(createContentSchema),
  AuthMiddleware,
  addContent
);
routes.get("/get-all-content", AuthMiddleware, getAllContent);
routes.delete("/delete-content", AuthMiddleware, deleteContent);
routes.get("/get-all-sources", getAllSources);
routes.get("/summary/:contentId", getContentSummary);

export default routes;
