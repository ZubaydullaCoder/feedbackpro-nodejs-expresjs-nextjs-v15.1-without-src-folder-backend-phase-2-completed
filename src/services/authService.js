import prisma from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";
import { hashPassword } from "../utils/hashPassword.js";

export const registerUser = async (data) => {
  const { email, password, business } = data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("EMAIL_EXISTS");
    }

    const hashedPassword = await hashPassword(password);

    const result = await prisma.$transaction(async (tx) => {
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
    logger.error("Registration service error:", error);
    throw error;
  }
};

export const loginUser = async (data) => {
  const { email, password } = data;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        business: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw { type: "INVALID_CREDENTIALS", message: "Invalid credentials" };
    }

    const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
    if (!isValidPassword) {
      throw { type: "INVALID_CREDENTIALS", message: "Invalid credentials" };
    }

    if (!user.isActive) {
      throw { type: "ACCOUNT_INACTIVE", message: "Account is inactive" };
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        businessId: user.business?.id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const userData = {
      id: user.id,
      email: user.email,
      role: user.role,
      business: user.business,
    };

    return {
      user: userData,
      token,
    };
  } catch (error) {
    logger.error("Login service error:", error);
    throw error;
  }
};
