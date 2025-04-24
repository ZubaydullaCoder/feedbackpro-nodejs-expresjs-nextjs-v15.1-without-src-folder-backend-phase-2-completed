import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .min(5, "Email is too short")
    .max(64, "Email is too long"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(64, "Password is too long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  business: z.object({
    name: z
      .string()
      .min(2, "Business name must be at least 2 characters")
      .max(100, "Business name is too long"),
    description: z
      .string()
      .max(500, "Business description is too long")
      .optional()
      .nullable(),
  }),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});
