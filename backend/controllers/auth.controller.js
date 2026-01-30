import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(
    `refreshToken: ${userId}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60,
  );
};

const setCookies = (res, accessToken, refreshToken) => {
  (res.cookie("accessToken", accessToken, {
    httpOnly: true, //prevent XSS attacks
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", //prevents CSRF attacks
    maxAge: 15 * 60 * 1000,
  }),
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, //prevent XSS attacks
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict", //prevents CSRF attacks
      maxAge: 7 * 24 * 60 * 60 * 1000,
    }));
};

export const signup = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }
    const user = await User.create({ name, email, password });

    // Authentication
    const { accessToken, refreshToken } = generateTokens(user._id);
    await storeRefreshToken(user._id, refreshToken);

    setCookies(res, accessToken, refreshToken);

    res
      .status(200)
      .json({ success: true, message: "User created successfully", user:{
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      } });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const login = async (req, res) => {
  res.send("login route called");
};

export const logout = async (req, res) => {
  res.send("logout route called");
};
