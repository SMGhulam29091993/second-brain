import express from "express";
import {
  createSession,
  destroySession,
  forgotPassword,
  refreshToken,
  registerUser,
  resetPassword,
  verifyEmail,
} from "../../../controller/user.controller";
import {
  createUserSchema,
  resetPasswordSchema,
  userLoginSchema,
} from "../../../dto/user.dto";
import { zodValidator } from "../../../middleware/zodValidate.middleware";

const routes = express.Router();

routes.post("/register", zodValidator(createUserSchema), registerUser);
routes.post("/login", zodValidator(userLoginSchema), createSession);
routes.post(
  "/send-reset-password-email",
  zodValidator(resetPasswordSchema),
  forgotPassword
);
routes.put("/reset-password/:userId", resetPassword);
routes.post("/verify/:hashedCode", verifyEmail);
routes.get("/refresh-token", refreshToken);
routes.post("/logout", destroySession);

export default routes;
