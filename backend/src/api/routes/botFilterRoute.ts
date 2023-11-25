import { Request, Response, NextFunction } from "express";
import CustomError from "../../classes/CustomError";
import BotConfig from "../../interfaces/BotConfig";
import fs from 'fs';
import logger from "../../util/loggers";
import { fetchBots } from "../../middlewares/botFilter";

  const configFilePath = './settings.json';

const botFilterPostRoute = async (
  req: Request,
  res: Response<{}, {}>,
  next: NextFunction
) => {
    try {
    const trackerData = req.body as BotConfig;
    console.log(trackerData);

    const newBot = trackerData.newBot;

    // Load the current configuration from the settings file
    const rawData = fs.readFileSync(configFilePath, 'utf-8');
    const configData = JSON.parse(rawData);

    // Check if the bot already exists in the configuration
    if (configData.bots && configData.bots.includes(newBot)) {
      return res.status(400).json({ message: 'Bot already exists in the configuration' });
    }

    // Add the new bot data to the configuration
    if (!configData.bots) {
      configData.bots = [];
    }
    configData.bots.push(newBot);

    // Write the updated configuration back to the settings file
    fs.writeFileSync(configFilePath, JSON.stringify(configData, null, 2));

    res.json({
      message: 'Bot added to settings file successfully',
    });
  } catch (error) {
    next(new CustomError((error as Error).message, 400));
  }
};

const botFilterDeleteRoute = async (
    req: Request,
    res: Response<{}, {}>,
    next: NextFunction
  ) => {
    try {
    const trackerData = req.body as BotConfig;
    console.log(trackerData);

    const botToDelete = trackerData.toBeDeleted;

    // Load the current configuration from the settings file
    const rawData = fs.readFileSync(configFilePath, 'utf-8');
    const configData = JSON.parse(rawData);

    // Check if the bot exists in the configuration
    if (!configData.bots || !configData.bots.includes(botToDelete)) {
      return res.status(400).json({ message: 'Bot does not exist in the configuration' });
    }

    // Delete the bot from the configuration
    const index = configData.bots.indexOf(botToDelete);
    if (index !== -1) {
      configData.bots.splice(index, 1);
      fs.writeFileSync(configFilePath, JSON.stringify(configData, null, 2));
    }

    res.json({
      message: 'Bot deleted from settings file successfully',
    });
  } catch (error) {
    next(new CustomError((error as Error).message, 400));
  }
};

  const botFilterGetRoute = async (
    req: Request,
    res: Response<{}, {}>,
    next: NextFunction
  ) => {
    try {
      const trackerData = req.body as BotConfig; // Pluginilta tai postmaniltä tuleva data
      console.log(trackerData); 
      
      const botList = await fetchBots(); 
        
      res.json({
        botList
      });
    } catch (error) {
      next(new CustomError((error as Error).message, 400));
    }
  };

export { botFilterPostRoute, botFilterDeleteRoute, botFilterGetRoute };