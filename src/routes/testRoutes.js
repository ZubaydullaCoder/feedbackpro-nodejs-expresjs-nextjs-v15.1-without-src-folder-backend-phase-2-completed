import { Router } from "express";
import jwt from "jsonwebtoken";
import { authenticateJWT } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/protected", authenticateJWT, (req, res) => {
  res.json({
    message: "You have accessed a protected route",
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

// TEMPORARY TEST ENDPOINT - REMOVE BEFORE PRODUCTION
router.post("/generate-test-token", (req, res) => {
  const testUser = {
    sub: "12345", // user id
    email: "test@example.com",
    role: "BUSINESS_OWNER",
  };

  const token = jwt.sign(testUser, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.json({ token });
});

export default router;
