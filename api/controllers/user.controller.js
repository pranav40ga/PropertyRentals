import Listing from "../models/listing.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import bcryptjs from "bcryptjs";
import cookieParser from "cookie-parser";

export const test = (req, res) => {
  res.json({
    message: "Hello api is working",
  });
};

// ==========================================UPDATE USER===================================================

export const updateUser = async (req, res, next) => {
  console.log("🔍 Checking user permissions...");
  console.log("User ID from Token:", req.user.id);
  console.log("User ID from Request Params:", req.params.id);

  // Convert both to strings before comparing
  if (req.user.id.toString() !== req.params.id.toString()) {
    console.log("🚨 Unauthorized: User ID does not match!");
    return next(errorHandler(401, "You can only update your own Account !"));
  }
  try {
    if (req.body.password) {
      req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          avatar: req.body.avatar,
        },
      },
      { new: true }
    );

    console.log("✅ User Updated Successfully:", updatedUser._id);

    const { password, ...rest } = updatedUser._doc;

    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

// ==================================================DELETE USER===============================================================

export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, "You can only delete your own account !!"));

  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Required for HTTPS
      sameSite: "Strict", // Ensure it matches frontend settings
      path: "/", // Important to match the original path
    });

    if (!deletedUser) {
      console.log("❌ User not found!");
      return next(errorHandler(404, "User not found!"));
    }
    res.status(200).json("User has been Deleted !!");
  } catch (error) {
    next(error);
  }
};

// =====================================================GET USER LISTINGS=========================================================

export const getUserListings = async (req, res, next) => {
  if (req.user.id === req.params.id) {
    try {
      const listings = await Listing.find({ userRef: req.params.id });
      res.status(200).json(listings);
    } catch (error) {
      next(error);
    }
  } else {
    return next(errorHandler(401, "You can only view your own listings"));
  }
};


// ==================================================GET USER======================================================================
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(errorHandler(404, "User not Found !!"));
    }

    const { password: pass, ...rest } = user._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};
