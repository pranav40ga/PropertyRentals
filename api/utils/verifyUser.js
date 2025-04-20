import { errorHandler } from "./error.js";
import jwt from "jsonwebtoken";
// import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();

export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) {
    console.log("🚨 No token provided!");
    return next(errorHandler(401, "Unauthorised"));
  }
  else{

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
      if (err) {
        console.log("🚨 Token verification failed!", err.message);
        return next(errorHandler(403, "Forbidden"));
      }
      console.log("✅ Token Verified! User ID:", user.id);
      req.user = user;
      next();
    });
  }
};