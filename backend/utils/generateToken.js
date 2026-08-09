import jwt from "jsonwebtoken";

const generateToken = (id, role) => {
  return jwt.sign(
    {
      id,
      role,
    },
    process.env.JWT_SECRET || "fallback_secret",
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },
  );
};

export default generateToken;
