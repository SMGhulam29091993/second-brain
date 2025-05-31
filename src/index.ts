import * as colors from "colors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import db from "./config/mongoose";
import { errorHandlerMiddleware } from "./middleware/errorHandler";
import routes from "./routes/api/v1/index";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = 3002;
db; // Initialize the database connection

/**
 * A list of allowed origins for Cross-Origin Resource Sharing (CORS).
 *
 * This array contains the URLs that are permitted to access resources
 * from this server. It includes:
 * - The local development URL (`http://localhost:5173`).
 * - A dynamic URL specified by the `FRONTEND_URL` environment variable.
 *
 * @constant
 * @type {string[]}
 */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL,
];

/**
 * Configuration options for CORS (Cross-Origin Resource Sharing).
 *
 * This object defines the behavior for handling cross-origin requests.
 * Specifically, it uses a dynamic origin validation function to determine
 * whether a request's origin is allowed or not.
 *
 * @property origin - A function that checks if the request's origin is allowed.
 * It takes two parameters:
 *
 * - `origin`: The origin of the incoming request as a string, or `undefined` if the request has no origin.
 * - `callback`: A callback function to signal whether the origin is allowed.
 *   - If the origin is allowed, the callback should be called with `(null, true)`.
 *   - If the origin is not allowed, the callback should be called with an `Error` object.
 *
 * The function allows requests if:
 * - The origin is included in the `allowedOrigins` array.
 * - The origin is `undefined` (e.g., for same-origin requests or non-browser clients).
 *
 * If the origin is not allowed, the function invokes the callback with an error message: "Not allowed by CORS".
 */
const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Register routes before error handler
app.use("/", routes);

// Register error handler AFTER all routes and regular middleware
app.use(errorHandlerMiddleware);

// 404 handler - for routes that don't exist
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.listen(PORT, (err) => {
  if (err) {
    return console.error(err);
  }
  return console.log(
    colors.bgGreen(
      `Server is listening on ${PORT} in ${process.env.NODE_ENV?.trim()} mode...`
    )
  );
});
