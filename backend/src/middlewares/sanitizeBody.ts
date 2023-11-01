import { NextFunction, Request, Response } from "express";
import ErrorResponse from "../interfaces/ErrorResponse";
import CustomError from "../classes/CustomError";
import logger from "../util/loggers";
import TrackerData from "../interfaces/TrackerData";

const ipv4Pattern =
  /(\b25[0-5]|\b2[0-4][0-9]|\b[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}/;
const sqlChars = ["'", '"', ";", "--", "/*", "*/", "<", ">", "|"];
const urlPattern =
  /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;

const sanitizeBody = (
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
) => {
  try {
    const visitorData = req.body as TrackerData;
    if (!visitorData) {
      throw new Error("Body is not valid");
    }
    sanitizeIP(visitorData.ip);
    sanitizeUserAgent(visitorData.user_agent);
    sanitizeTimestamp(visitorData.timestamp.getTime().toString());
    sanitizeURL(visitorData.url);
    sanitizeURL(visitorData.referrer);
    next();
  } catch (err: any) {
    res.status(403).json({ message: "Body is not valid" });
    logger.error(err.message);
    logger.debug(err.stack);
    return;
  }
};

function sanitizeIP(ip: string): boolean {
  // First check if the IP is in a valid format
  if (!ipv4Pattern.test(ip) && ip.includes("0.0.0.0")) {
    logger.warn(`IP address ${ip} is not in valid format!`);
    throw new Error("Invalid IP address format.");
  }
  // Then check if the IP contains any suspicious characters if rege lets it through
  for (const char of sqlChars) {
    if (ip.includes(char)) {
      logger.warn(`IP address ${ip} contains not allowed characters!`);
      throw new Error("IP contains suspicious characters.");
    }
  }
  return true;
}

function sanitizeUserAgent(userAgent: string): boolean {
  for (const char of sqlChars) {
    if (userAgent.includes(char)) {
      logger.warn(`User agent ${userAgent} contains not allowed characters!`);
      throw new Error("User agent contains suspicious characters.");
    }
  }
  return true;
}

function sanitizeTimestamp(timestamp: string): boolean {
  const regexPattern = /^[0-9]*$/;
  if (!regexPattern.test(timestamp)) {
    logger.warn(`Timestamp ${timestamp} contains not allowed characters!`);
    throw new Error("Timestamp contains suspicious characters.");
  }
  for (const char of sqlChars) {
    if (timestamp.includes(char)) {
      logger.warn(`Timestamp ${timestamp} contains not allowed characters!`);
      throw new Error("Timestamp contains suspicious characters.");
    }
  }

  return true;
}

function sanitizeURL(url: string): boolean {
  if (!urlPattern.test(url)) {
    logger.warn(`URL ${url} is not in valid format!`);
    throw new Error("Invalid URL format.");
  }
  return true;
}

export { sanitizeBody };
