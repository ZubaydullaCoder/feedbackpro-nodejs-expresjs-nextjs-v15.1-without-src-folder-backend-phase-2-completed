import passport from "passport";
import logger from "../utils/logger.js";

export const authenticateJWT = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      logger.error("JWT Authentication Error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;
    next();
  })(req, res, next);
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

export const requireActiveUser = (req, res, next) => {
  if (!req.user?.isActive) {
    return res.status(403).json({ message: "Account is inactive" });
  }
  next();
};
