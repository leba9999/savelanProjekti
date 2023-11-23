/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import ErrorResponse from "../interfaces/ErrorResponse";
import CustomError from "../classes/CustomError";
import logger from "../util/loggers";

const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new CustomError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};

const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
) => {
  logger.error(error.message);
  logger.debug(error.stack);
  res.status(error.status || 500);
  res.json({
    message: error.message,
  });
};

export { notFound, errorHandler };
