import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { errorHandler } from "../utils/error.js";

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;
  const hashPassword = bcryptjs.hashSync(password, 10);
  const newUser = new User({ username, email, password: hashPassword });

  try {
    await newUser.save();
    res.status(201).json({ message: "User created Successfully" });
  } catch (err) {
    next(err);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const validUser = await User.findOne({ email });
    // console.log("Done checking user");
    if (!validUser) {
      throw next(errorHandler(404, "User not Found"));
    }
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    // console.log("Done checking pass");
    if (!validPassword) {
      throw next(errorHandler(401, "Invalid Credentials"));
    }
    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET_KEY);
    const { password: pass, ...rest } = validUser._doc;
    res
      .cookie("access_token", token, { httpOnly: true })
      .status(200)
      .json(rest);
  } catch (error) {
    next(error);
  }
};



export const signout=(req,res,next)=>{
  try{
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set to true only in production
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // Adjust based on environment
      path: "/",
    });
    
    res.status(200).json({ message: 'User has been Logged Out Successfully !!' });

  }catch(error)
  {
    next(error);

  }
}