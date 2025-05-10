import jwt from "jsonwebtoken";

export const getUserFromToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new Error("Authorization header missing");

  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  return {
    email: decoded.email,
    name: decoded.name,
    profilePicture: decoded.profilePicture
  };
};
