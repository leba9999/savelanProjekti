import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const customFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `[${new Date(timestamp).toLocaleString([], {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })}][${level}] : ${message}`;
});

const transport = new DailyRotateFile({
  filename: "logs/tracker-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
  format: winston.format.combine(
    winston.format.timestamp(),
    customFormat // Use the custom format for log files
  ),
});

const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(), // Add colors to the console output
    customFormat
  ),
});

const logger = winston.createLogger({
  level: "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [consoleTransport, transport],
});

export default logger;
