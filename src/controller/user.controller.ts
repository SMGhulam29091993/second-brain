import bcryptjs from "bcryptjs";
import { config } from "dotenv";
import { NextFunction, Request, Response } from "express";
import { UserDto } from "../constants/types";
import { createUserInput } from "../dto/user.dto";
import { generateVerifiactionCode, sendResponse } from "../lib/helper.function";
import { sendMail } from "../lib/nodemailer";
import Otp from "../models/otp.model";
import User from "../models/user.model";
import { createToken, validateToken } from "../utils/features";
import { generateHash } from "./link.controller";

config();

/**
 * Registers a new user in the system.
 *
 * @param req - The HTTP request object containing user registration details.
 * @param res - The HTTP response object used to send responses to the client.
 * @param next - The next middleware function in the Express.js request-response cycle.
 *
 * @remarks
 * - Checks if a user with the provided email already exists. If so, responds with a 403 status.
 * - Hashes the user's password before saving it to the database.
 * - Creates a new user in the database with the provided details.
 * - Excludes the password from the response object for security reasons.
 * - If the user's email is not verified, generates a verification hash.
 * - Sends an email verification code to the user's email address.
 * - Responds with a 201 status if the user is successfully created.
 * - If user creation fails, responds with a 400 status.
 * - Passes any errors to the next middleware function.
 *
 * @throws Will pass any unexpected errors to the next middleware.
 */
export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let verificationHash: string | null = null;

    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      sendResponse(res, 403, false, "User already exists", existingUser);
      return;
    }

    const hashPassword = await bcryptjs.hash(req.body.password, 10);
    const userData: createUserInput = {
      ...req.body,
      password: hashPassword,
    };
    const registerUser = await User.create(userData);

    const { password, ...user } = registerUser.toObject(); // Exclude password from the response

    if (!user.isEmailVerified) {
      verificationHash = await generateHash(10);
    }

    if (!registerUser) {
      sendResponse(res, 400, false, "User not created", null);
      return;
    }

    let code = await generateVerifiactionCode(); // Generate a random verification code
    const codeAndHashStore = await Otp.create({
      userId: registerUser._id,
      hashedCode: verificationHash,
      code: code,
    });
    if (!codeAndHashStore) {
      sendResponse(res, 400, false, "Code not created", null);
    }
    await sendMail(
      user.email,
      String(process.env.SMTP_USER),
      "Email Verification Code",
      `<h1>Welcome ${user.username}</h1><p>Please verify your email with the given code : ${code} "</p>`
    );
    sendResponse(res, 201, true, "User created successfully", {
      hashedCode: verificationHash,
    });
    return;
  } catch (error) {
    next(error);
  }
};

/**
 * Handles the creation of a user session by authenticating the user and generating a token.
 *
 * @param req - The HTTP request object containing user credentials in the body.
 * @param res - The HTTP response object used to send responses back to the client.
 * @param next - The next middleware function in the Express.js request-response cycle.
 *
 * @returns A Promise that resolves to void. Sends appropriate HTTP responses based on the authentication process.
 *
 * @throws Passes any unexpected errors to the next middleware for error handling.
 *
 * Functionality:
 * - Fetches the user from the database using the provided email.
 * - Verifies the user's password using bcryptjs.
 * - If the email is not verified, sends a verification email with a code and hash first it will delete the old code & hash if exist.
 * - If authentication is successful, generates a token and sends it in the response.
 * - Excludes the password from the user object in the response.
 */
export const createSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const fetchUser = await User.findOne({ email: req.body.email }).select(
      "+password"
    );
    if (!fetchUser) {
      sendResponse(res, 404, false, "User not found", null);
      return;
    }
    const isValidPassword = await bcryptjs.compare(
      req.body.password,
      fetchUser.password
    );
    if (!isValidPassword) {
      sendResponse(res, 403, false, "Invalid Credentials", null);
      return;
    }

    if (isValidPassword && !fetchUser.isEmailVerified) {
      const existHashedCode = await Otp.findOne({ userId: fetchUser._id });
      if (existHashedCode) {
        await Otp.deleteOne({ userId: fetchUser._id });
      }
      const verificationHash = await generateHash(10); // Generate a new verification hash
      const code = await generateVerifiactionCode(); // Generate a random verification code

      await sendMail(
        fetchUser.email,
        String(process.env.SMTP_USER),
        "Email Verification Code",
        `<h1>Welcome ${fetchUser.username}</h1><p>Please verify your email with the given code : ${code} "</p>`
      );
      sendResponse(res, 200, true, "User Email not verified", verificationHash);
      return;
    }
    const { password, ...user } = fetchUser.toObject(); // Exclude password from the response

    const userData: UserDto = {
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
    };
    await createToken(res, userData, "Login successful");
    return;
  } catch (error) {
    next(error);
  }
};

/**
 * Handles the refresh token functionality for user authentication.
 *
 * @param req - The HTTP request object, which contains the cookies with the refresh token.
 * @param res - The HTTP response object, used to send the response back to the client.
 * @param next - The next middleware function in the Express.js request-response cycle.
 *
 * @returns A Promise that resolves to void. Sends a response to the client with the refreshed token or an error message.
 *
 * @throws Passes any unexpected errors to the next middleware for error handling.
 *
 * The function performs the following steps:
 * 1. Extracts the refresh token from the request cookies.
 * 2. Validates the token and retrieves the associated user data.
 * 3. Checks if the user exists in the database.
 * 4. Constructs a `UserDto` object with the user's details.
 * 5. Creates a new token and sends it back to the client.
 * 6. Handles errors by passing them to the next middleware.
 */
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies["refresh-token"];
    if (!token) {
      sendResponse(res, 403, false, "Unauthorized Action", null);
      return;
    }
    const data = await validateToken(token);
    const userData = await User.findById({ _id: data });
    if (!userData) {
      sendResponse(res, 403, false, "Unauthorized Action", null);
      return;
    }
    const user: UserDto = {
      _id: userData._id.toString(),
      username: userData.username,
      email: userData.email,
      isEmailVerified: userData.isEmailVerified,
    };
    await createToken(res, user, "Token refreshed successfully");
    return;
  } catch (error) {
    next(error);
  }
};

/**
 * Verifies the user's email by validating the provided OTP code.
 *
 * @param req - The HTTP request object containing the hashed OTP code in `params`
 *              and the plain OTP code in the request body.
 * @param res - The HTTP response object used to send the response back to the client.
 * @param next - The next middleware function in the Express.js request-response cycle.
 *
 * @throws Will pass any unexpected errors to the next middleware.
 *
 * The function performs the following steps:
 * 1. Retrieves the hashed OTP code from the request parameters and the plain OTP code from the request body.
 * 2. Searches for the OTP data in the database using the hashed code.
 * 3. If no OTP data is found, sends a 403 response with an "Invalid code" message.
 * 4. Fetches the user associated with the OTP data using the user ID.
 * 5. If no user is found, sends a 403 response with an "Invalid code" message.
 * 6. Compares the provided OTP code with the stored OTP code.
 * 7. If the codes do not match, sends a 403 response with an "Invalid code" message.
 * 8. Marks the user's email as verified and saves the user data.
 * 9. Deletes the OTP data associated with the user.
 * 10. Creates a token for the user and sends a success response with the token.
 */
export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const hashedCode = req.params.hashedCode;
    const code = req.body.code;
    const otpData = await Otp.findOne({ hashedCode: hashedCode });
    if (!otpData) {
      sendResponse(res, 403, false, "Invalid code", null);
      return;
    }
    const fetchUser = await User.findById(otpData.userId);
    if (!fetchUser) {
      sendResponse(res, 403, false, "Invalid code", null);
      return;
    }
    if (otpData.code !== code) {
      sendResponse(res, 403, false, "Invalid code", null);
      return;
    }
    fetchUser.isEmailVerified = true;
    await fetchUser.save();

    await Otp.deleteOne({ userId: fetchUser._id });

    let userTokenData: UserDto = {
      _id: fetchUser._id.toString(),
      username: fetchUser.username,
      email: fetchUser.email,
      isEmailVerified: fetchUser.isEmailVerified,
    };
    await createToken(res, userTokenData, "Email verified successfully");
    return;
  } catch (error) {
    console.error(error);
    next(error);
  }
};

/**
 * Handles the destruction of a user session by clearing the "refresh-token" cookie.
 *
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 * @param next - The next middleware function in the stack.
 * @returns A promise that resolves to void.
 *
 * @remarks
 * - The "refresh-token" cookie is cleared with specific options:
 *   - `httpOnly`: Ensures the cookie is only accessible via HTTP(S) requests.
 *   - `secure`: Sets the cookie to be sent only over HTTPS in production.
 *   - `sameSite`: Configures the cookie's SameSite attribute based on the environment.
 * - Sends a response with a success message upon successful logout.
 * - Passes any errors to the next middleware using the `next` function.
 */
export const destroySession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res
      .status(200)
      .clearCookie("refresh-token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? true : false,
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      })
      .send({
        statusCode: 200,
        success: true,
        message: "Logout successful",
        data: null,
      });
    return;
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      sendResponse(res, 404, false, "Please enter a valid email", null);
      return;
    }
    const generateResetLink = `${process.env.FRONTEND_BASE_URL}/reset-password/${user._id}`;
    await sendMail(
      user.email,
      String(process.env.SMTP_USER),
      "Reset Password",
      `<h1>Dear ${user.username}, <br></br></h1><p>Please reset your password using the following link: <a href="${generateResetLink}">Reset Password</a></p>`
    );
    sendResponse(
      res,
      200,
      true,
      "Password reset link sent to your email",
      null
    );
    return;
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { password } = req.body;

    const userData = await User.findById(userId).select("+password");

    if (!userData) {
      sendResponse(res, 404, false, "User not found", null);
      return;
    }

    const isSameOldPassword = await bcryptjs.compare(
      password,
      userData.password
    );

    if (isSameOldPassword) {
      sendResponse(
        res,
        400,
        false,
        "New password cannot be the same as the old password",
        null
      );
      return;
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    userData.password = hashedPassword;
    await userData.save();
    sendResponse(res, 200, true, "Password reset successfully", null);
    return;
  } catch (error) {
    next(error);
  }
};
