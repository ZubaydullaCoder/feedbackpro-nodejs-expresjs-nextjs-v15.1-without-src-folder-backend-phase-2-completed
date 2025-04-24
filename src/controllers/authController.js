import { registerSchema } from "../validators/authSchemas.js";
import { AuthService } from "../services/authService.js";
import logger from "../utils/logger.js";

export class AuthController {
  static async register(req, res) {
    try {
      // Validate request body
      const validatedData = registerSchema.parse(req.body);

      // Register user
      const result = await AuthService.registerUser(validatedData);

      return res.status(201).json({
        message: "Registration successful",
        data: result,
      });
    } catch (error) {
      logger.error("Registration controller error:", error);

      // Zod validation error
      if (error.errors) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.errors,
        });
      }

      // Known error types
      if (error.type === "EMAIL_EXISTS") {
        return res.status(409).json({
          message: error.message,
        });
      }

      // Unknown error
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
}
