import { registerSchema, loginSchema } from "../validators/authSchemas.js";
import * as authService from "../services/authService.js";
import logger from "../utils/logger.js";

export const register = async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const result = await authService.registerUser(validatedData);

    return res.status(201).json({
      message: "Registration successful",
      data: result,
    });
  } catch (error) {
    logger.error("Registration controller error:", error);

    if (error.errors) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.errors,
      });
    }

    if (error.message === "EMAIL_EXISTS") {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const login = async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { user, token } = await authService.loginUser(validatedData);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return res.status(200).json({
      message: "Login successful",
      data: { user },
    });
  } catch (error) {
    logger.error("Login controller error:", error);

    if (error.errors) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.errors,
      });
    }

    if (error.type === "INVALID_CREDENTIALS") {
      return res.status(401).json({
        message: error.message,
      });
    }

    if (error.type === "ACCOUNT_INACTIVE") {
      return res.status(403).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
