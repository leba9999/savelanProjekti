/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import ErrorResponse from "./interfaces/ErrorResponse";
import CustomError from "./classes/CustomError";
import logger from "./util/loggers";
import TrackerData from "./interfaces/TrackerData";

// Define a list of regular expressions to match common bot user agents
const botPatterns: RegExp[] = [
  /Googlebot/i,
  /bingbot/i,
  /Yahoo! Slurp/i,
  /YandexBot/i,
  /Baiduspider/i,
  /DuckDuckbot/i,
  /ReverseEngineeringBot/i,
  /SeekportBot/i,
  /DecompilationBot/i,
  /AhrefsBot/i,
  /DongleEmulatorBot/i,
  // Add more bot user agent patterns as needed
];

const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new CustomError(`🔍 - Not Found - ${req.originalUrl}`, 404);
  next(error);
};

const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
) => {
  logger.error(err.message);
  logger.debug(err.stack);
  res.status(err.status || 500);
  res.json({
    message: err.message,
  });
};

// Test out if the user agent contains any of the known bots
function isBot(userAgent: string): boolean {
  for (const pattern of botPatterns) {
    if (pattern.test(userAgent)) {
      return true;
    }
  }
  return false;
}

const botFilter = (
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
) => {
  // Access visitor data from the request body
  const visitorData = req.body as TrackerData;
  const userAgent = visitorData.user_agent;

  if (isBot(userAgent)) {
    // TODO : Jos halutaan jotain logiikkaa kun botti on havaittu
    // Do not process data for bots
    logger.info(
      `Bot detected - ip:${visitorData.ip} current:${visitorData.url} user-agent:${userAgent}`
    );
    res.status(403).json({ message: "Bot detected" });
  } else {
    // Process data for non-bots
    next();
  }
};

export { notFound, errorHandler, botFilter };
