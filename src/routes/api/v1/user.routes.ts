import express from "express";
import {
  createSession,
  refreshToken,
  registerUser,
  verifyEmail,
} from "../../../controller/user.controller";
import { createUserSchema, userLoginSchema } from "../../../dto/user.dto";
import { zodValidator } from "../../../middleware/zodValidate.middleware";

const routes = express.Router();

routes.post("/register", zodValidator(createUserSchema), registerUser);
routes.post("/login", zodValidator(userLoginSchema), createSession);
routes.post("/verify/:hashedCode", verifyEmail);
routes.get("/refresh-token", refreshToken);

export default routes;
