import { NextFunction, Request, Response } from "express";
import ErrorResponse from "../interfaces/ErrorResponse";
import * as fs from 'fs/promises'; // Import the 'fs/promises' module

// Function to fetch the existing bots from the configuration file
async function fetchBots() {
    try {
        const configFilePath = './settings.json';
        const data = await fs.readFile(configFilePath, 'utf8');
        const configData = JSON.parse(data);

        // Check if the 'bots' property exists and is an array.
        if (!configData.bots || !Array.isArray(configData.bots)) {
            return [];
        }
        return configData.bots;
    } catch (error) {
        console.error('Error fetching bots:', error);
        return [];
    }
}

// Function to check the syntax of the user agent and extract the bot name
async function checkUseragentSyntax(userAgent: string): Promise<string | null> {
    const patternList: string[] = ['sweeper', 'bot', 'spider', 'crawler'];
    let extractedBotName: string | null = null;

    // Iterate through the pattern list to find a match in the user agent
    patternList.forEach(element => {
        const lowerCaseUserAgent = userAgent.toLowerCase();
        if (lowerCaseUserAgent.includes(element)) {
            const match = new RegExp(`\\b(\\w+${element})\\b`).exec(lowerCaseUserAgent);
            if (match && match[1]) {
                console.log("true");
                extractedBotName = match[1];
            }
        }
    });

    console.log("false");
    return extractedBotName;
}

// Middleware function to filter and process bots in the user agent
const botFilter = async (req: Request, res: Response<ErrorResponse>, next: NextFunction) => {
    const visitorData = req.body;
    const userAgent = visitorData.user_agent;
    const configFilePath = './settings.json';

    try {
        // Fetch the existing bots from the configuration file
        const existingBots = await fetchBots();
        // Check the syntax of the user agent and extract the bot name
        const extractedBotName = await checkUseragentSyntax(userAgent);

        let botDetected = false;
        let newBotDetected = false;

        // Check if the user agent contains any of the existing bots
        existingBots.forEach(function (bot: string) {
            if (userAgent.includes(bot)) {
                botDetected = true;
            }
        });

        // If a bot is detected, send a response with a 403 status and appropriate message
        if (botDetected) {
            res.status(403).json({ message: "Bot detected" });
        } else if (extractedBotName) {
            // If a new bot is detected, add it to the existing bots and update the configuration file
            existingBots.push(extractedBotName);
            await fs.writeFile(configFilePath, JSON.stringify({ bots: existingBots }, null, 2));
            newBotDetected = true;
            res.status(403).json({ message: "New bot detected and added" });
        } else {
            // If no bot is detected, proceed to the next middleware
            next();
        }
    } catch (error) {
        // Handle errors and pass them to the next middleware
        console.error('Error processing bot:', error);
        next(error);
    }
};

// Export the middleware function for use in other files
export { botFilter };