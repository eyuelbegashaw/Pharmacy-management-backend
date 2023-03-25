import jwt from "jsonwebtoken";

// Generate JWT
const generateToken = (id, name, email, isAdmin) => {
  return jwt.sign({id, name, email, isAdmin}, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export default generateToken;
