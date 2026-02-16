const AppError = require('./AppError');

const badRequest = (msg) => new AppError(msg, 400);
const unauthorized = (msg) => new AppError(msg, 401);
const forbidden = (msg) => new AppError(msg, 403);
const notFound = (msg) => new AppError(msg, 404);
const conflict = (msg) => new AppError(msg, 409);

module.exports = {
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
};
