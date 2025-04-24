import prisma from "../config/db.js";
import { hashPassword } from "../utils/hashPassword.js";
import logger from "../utils/logger.js";

export class AuthService {
  static async registerUser(data) {
    const { email, password, business } = data;

    try {
      // Check if email exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error("EMAIL_EXISTS");
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user and business in transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
          data: {
            email,
            hashedPassword,
            role: "BUSINESS_OWNER",
          },
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
        });

        // Create associated business
        const createdBusiness = await tx.business.create({
          data: {
            name: business.name,
            description: business.description,
            userId: user.id,
          },
          select: {
            id: true,
            name: true,
            description: true,
          },
        });

        return { user, business: createdBusiness };
      });

      return result;
    } catch (error) {
      logger.error("Registration error:", error);

      if (error.message === "EMAIL_EXISTS") {
        throw { type: "EMAIL_EXISTS", message: "Email already registered" };
      }

      throw { type: "SERVER_ERROR", message: "Registration failed" };
    }
  }
}
