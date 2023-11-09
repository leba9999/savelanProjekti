import e, { Request, Response, NextFunction } from "express";
import CustomError from "../../classes/CustomError";
import { ClientData } from "../../entities/clientData.entity";
import { URL } from "../../entities/url.entity";
import { Company } from "../../entities/company.entity";
import { DBConnection } from "../../util/data-source";
import TrackerData from "../../interfaces/TrackerData";
import axios from "axios";
import AxiosRateLimit from "axios-rate-limit";
import logger from "../../util/loggers";

const ITEMS_PER_PAGE = 2;

// Create an Axios instance with a base URL
const api = axios.create({
  baseURL: `http://ip-api.com`,
});
// Create a rate-limited instance with a maximum of 40 requests per minute
// Because the IP API is free, we need to rate-limit our requests to avoid getting blocked
// 45 requests per minute is the maximum allowed by the IP API
let rateLimitedApi: any;
if (process.env.DISABLE_RATE_LIMIT === "false") {
  rateLimitedApi = api; // No rate limiting
  logger.warn(`IP api rate limiting is disabled!`);
} else {
  rateLimitedApi = AxiosRateLimit(api, {
    maxRequests: 40,
    perMilliseconds: 60000,
  });
}

const ipv4Pattern =
  /(\b25[0-5]|\b2[0-4][0-9]|\b[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}/;
const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
const uploadRoute = async (
  req: Request,
  res: Response<{}, {}>,
  next: NextFunction
) => {
  try {
    if (!req.body) {
      next(new CustomError("body not valid", 400));
      return;
    }

    const clientRepository = DBConnection.getRepository(ClientData);
    const companyRepository = DBConnection.getRepository(Company);
    const urlRepository = DBConnection.getRepository(URL);
    const visitorData = req.body as TrackerData;

    logger.info(`Client connected: ${JSON.stringify(visitorData)}`);
    if (
      ipv4Pattern.test(visitorData.ip) &&
      !visitorData.ip.includes("0.0.0.0")
    ) {
      rateLimitedApi
        .get(`/json/${visitorData.ip}`)
        .then(async (response: any) => {
          logger.info(`IP API response:${JSON.stringify(response.data)}`);
          if (response.data?.status === "fail") {
            next(
              new CustomError(
                `IP API response:${JSON.stringify(response.data)}`,
                400
              )
            );
            return;
          }
          let existingCompany =
            ((await companyRepository.findOne({
              where: { NAME: response.data.org },
            })) as Company) || new Company();
          existingCompany.IP = visitorData.ip;
          existingCompany.NAME = response.data.org;
          if (
            visitorData.ip.includes("::1") ||
            visitorData.ip.includes("127.0.0.1")
          ) {
            // ::1 is the IPv6 equivalent of 127.0.0.1 which is the localhost IP address
            existingCompany.NAME = "localhost";
            existingCompany.IP = "127.0.0.1";
          }
          let existingURL = await urlRepository.findOne({
            where: { Adress: visitorData.url },
          });
          let existingReferrerURL = await urlRepository.findOne({
            where: { Adress: visitorData.referrer },
          });

          if (!existingURL) {
            existingURL = new URL();
            existingURL.Adress = visitorData.url;
          }
          if (!existingReferrerURL) {
            existingReferrerURL = new URL();
            existingReferrerURL.Adress = visitorData.referrer;
          }
          if (existingURL.Adress === existingReferrerURL.Adress) {
            existingReferrerURL = existingURL;
          }
          // Create the ClientData record
          const clientData = new ClientData();
          clientData.Company = existingCompany;
          clientData.CurrentPage = existingURL;
          clientData.SourcePage = existingReferrerURL;
          clientData.TimeStamp = new Date(visitorData.timestamp);
          clientData.UserAgent = visitorData.user_agent;

          const savedData = await clientRepository.save(clientData);
          logger.info(`saved data:${JSON.stringify(savedData)}`);
          res.json(savedData);
        })
        .catch((error: any) => {
          next(new CustomError((error as Error)?.message, 400));
        });
    } else {
      next(new CustomError(`Client ip:${visitorData.ip} not valid`, 400));
    }
  } catch (error) {
    next(new CustomError((error as Error).message, 400));
  }
};

const getDataRoute = async (
  req: Request,
  res: Response<{}, {}>,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string, 10) || (1 as number);

    // Calculate the skip (offset) based on the page number
    const skip = (page - 1) * ITEMS_PER_PAGE;

    // Find users with pagination

    const clientRepository = DBConnection.getRepository(ClientData);
    const totalCount = await clientRepository.count();
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
    const currentPage = page;

    //const clientData = await clientRepository.find();
    logger.info(`Client fetching data`);
    const clientData = await clientRepository
      .createQueryBuilder("ClientData")
      .leftJoinAndSelect("ClientData.CurrentPage", "currentPage")
      .leftJoinAndSelect("ClientData.SourcePage", "sourcePage")
      .leftJoinAndSelect("ClientData.Company", "company")
      .orderBy("ClientData.ID", "DESC")
      .skip(skip)
      .take(ITEMS_PER_PAGE)
      .getMany();
    res.json({ currentPage, totalPages, clientData });
  } catch (error) {
    next(new CustomError((error as Error).message, 400));
  }
};

export { uploadRoute, getDataRoute };
