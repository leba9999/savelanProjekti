import { NextFunction, Request, Response } from "express";
import ErrorResponse from "../interfaces/ErrorResponse";

async function fetchBots() {
    try {
        // Load the configuration file.
        const configFilePath = '../../settings.json';
  
        // Fetch the current configuration.
        const response = await fetch(configFilePath);
  
        if (!response.ok) {
            throw new Error('Failed to fetch configuration file');
        }
  
        const configData = await response.json();
  
        if (!configData.bots || !Array.isArray(configData.bots)) {
            return [];
        }
  
        return configData.bots;
    } catch (error) {
        console.error('Error fetching bots:', error);
        return [];
    }
  }

const botFilter = (
    req: Request,
    res: Response<ErrorResponse>,
    next: NextFunction
  ) => {
    const visitorData = req.body;
    const userAgent = visitorData.user_agent;
  
    // Fetch the bots from your configuration file
    fetchBots()
      .then((bots) => {
        if (bots.includes(userAgent)) {
          // Do not process data for bots or specific user agents
          res.status(403).json({ message: "Bot detected" });
        } else {
          // Process data for non-bots
          // Add your custom logic for non-bots here.
          next();
        }
      })
      .catch((error) => {
        console.error('Error fetching bots:', error);
        // Handle the error as needed
        next(error);
      });
  };

  export {botFilter};