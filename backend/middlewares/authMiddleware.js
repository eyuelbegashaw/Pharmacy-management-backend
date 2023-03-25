import jwt from "jsonwebtoken";

const protect = async (req, res, next) => {
  let token;
  try {
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      try {
        // Get token from header
        token = req.headers.authorization.split(" ")[1];

        // Verify token
        jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
          if (err) {
            res.status(401);
            throw new Error(err.message);
          } else {
            req.user = decoded;
            next();
          }
        });
      } catch (error) {}
    }

    if (!token) {
      res.status(401);
      throw new Error("Not authorized, no token");
    }
  } catch (error) {
    next(error);
  }
};

const admin = async (req, res, next) => {
  try {
    if (req.user && req.user.isAdmin) {
      next();
    } else {
      res.status(401);
      throw new Error("Not authorized as an admin");
    }
  } catch (error) {
    next(error);
  }
};

export {admin, protect};
