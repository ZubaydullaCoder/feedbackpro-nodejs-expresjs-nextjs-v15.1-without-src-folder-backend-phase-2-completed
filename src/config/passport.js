import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import prisma from "./db.js";
import logger from "../utils/logger.js";

const cookieExtractor = (req) => {
  return req?.cookies?.token || null;
};

const options = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    cookieExtractor,
    ExtractJwt.fromAuthHeaderAsBearerToken(),
  ]),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(options, async (jwtPayload, done) => {
    try {
      console.log({ jwtPayload });
      const user = await prisma.user.findUnique({
        where: { id: jwtPayload.id },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
        },
      });

      if (!user) {
        return done(null, false);
      }

      if (!user.isActive) {
        return done(null, false);
      }

      return done(null, user);
    } catch (error) {
      logger.error("Passport JWT Strategy Error:", error);
      return done(error, false);
    }
  })
);

export default passport;
