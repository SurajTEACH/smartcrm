import jwt from "jsonwebtoken";
import Blacklist from "../models/Blacklist.js";

export const isAuth = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    }

    // check blacklist
    const blacklisted = await Blacklist.findOne({ token });
    if (blacklisted) {
      return res.status(401).json({ message: "Token expired, login again" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();

  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};