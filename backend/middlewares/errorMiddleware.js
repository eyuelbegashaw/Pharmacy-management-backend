export const NotFound = (req, res, next) => {
  res.status(404).json("Page Not Found");
};

export const ErrorMiddleware = (error, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  return res.status(statusCode).json({
    message: error.message,
    stack: process.env.NODE_ENV === "production" ? null : error.stack,
  });
};
