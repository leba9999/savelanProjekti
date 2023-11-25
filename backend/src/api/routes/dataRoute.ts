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
import * as url from "url";
import { wait, normalizeUrl } from "../../util/helpers";
import {
  Between,
  Brackets,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
} from "typeorm";

// Create an Axios instance with a base URL
const api = axios.create({
  baseURL: `http://ip-api.com`,
});
const maxRetries = 3;
let attempt = 1;
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
    res.json("Data uploaded");
    if (!req.body) {
      next(new CustomError("body not valid", 400));
      return;
    }

    const clientRepository = DBConnection.getRepository(ClientData);
    const companyRepository = DBConnection.getRepository(Company);
    const urlRepository = DBConnection.getRepository(URL);
    const visitorData = req.body as TrackerData;
    visitorData.url = normalizeUrl(visitorData.url, "https://www.savelan.fi");
    visitorData.referrer = normalizeUrl(
      visitorData.referrer,
      "https://www.savelan.fi"
    );

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

          while (attempt <= maxRetries) {
            try {
              let existingCompany =
                ((await companyRepository.findOne({
                  where: { Name: response.data.org || response.data.isp },
                })) as Company) || new Company();
              existingCompany.IP = visitorData.ip;
              existingCompany.Name = response.data.org || response.data.isp;
              if (
                visitorData.ip.includes("::1") ||
                visitorData.ip.includes("127.0.0.1")
              ) {
                // ::1 is the IPv6 equivalent of 127.0.0.1 which is the localhost IP address
                existingCompany.Name = "localhost";
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
              break;
            } catch (error: any) {
              if (attempt < maxRetries) {
                logger.info(
                  `Attempt ${attempt} failed, to error. Retrying in 1 second`
                );
                logger.error(error?.message);
                logger.debug(error?.stack);
                await wait(1000);
                attempt++;
              } else {
                next(new CustomError((error as Error)?.message, 400));
                break;
              }
            }
          }
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
// Utility function to make object keys case-insensitive
const makeKeysCaseInsensitive = (obj: Record<string, any>) => {
  const result: Record<string, any> = {};
  for (const key in obj) {
    result[key.toLowerCase()] = obj[key];
  }
  return result;
};

const getDataRoute = async (
  req: Request,
  res: Response<{}, {}>,
  next: NextFunction
) => {
  try {
    const query = makeKeysCaseInsensitive(req.query);
    let page = parseInt(query.page as string, 10) || (1 as number);
    let pageSize = parseInt(query.pagesize as string, 10) || (20 as number);
    let startDate: Date | undefined;
    let endDate: Date | undefined;
    let companyName: string | undefined;
    let companyId: number | undefined;
    let url: string | undefined;
    let Id: number | undefined;
    let currentURLId: number | undefined;
    let sourceURLId: number | undefined;

    if (pageSize > 500) {
      pageSize = 500;
    } else if (pageSize < 1) {
      pageSize = 5;
    }

    if (query.startdate) {
      startDate = new Date(
        parseInt(query.startdate as string, 10) || (query.startdate as string)
      );
    }
    if (query.enddate) {
      endDate = new Date(
        parseInt(query.enddate as string, 10) || (query.enddate as string)
      );
    }
    if (query.companyname) {
      companyName = query.companyname as string;
    }
    if (query.url) {
      url = decodeURIComponent(query.url as string);
    }
    if (query.companyid) {
      companyId = parseInt(query.companyid as string, 10)  as number || undefined;
    }
    if (query.currenturlid) {
      currentURLId = parseInt(query.currenturlid as string, 10) as number || undefined;
    }
    if (query.sourceurlid) {
      sourceURLId = parseInt(query.sourceurlid as string, 10) as number || undefined;
    }
    if (query.id) {
      Id = parseInt(query.id as string, 10) as number || undefined;
    }

    // Calculate the skip (offset) based on the page number
    const skip = (page - 1) * pageSize;

    const whereConditions: any = {};
    if (startDate && endDate) {
      whereConditions.TimeStamp = Between(startDate, endDate);
    } else if (startDate) {
      whereConditions.TimeStamp = MoreThanOrEqual(startDate);
    } else if (endDate) {
      whereConditions.TimeStamp = LessThanOrEqual(endDate);
    }
    if (companyName) {
      whereConditions.Company = whereConditions.Company || {};
      whereConditions.Company.NAME = ILike(`%${companyName}%`);
    }
    if (companyId) {
      whereConditions.Company = whereConditions.Company || {};
      whereConditions.Company.ID = companyId;
    }
    if (currentURLId) {
      whereConditions.CurrentPage = whereConditions.CurrentPage || {};
      whereConditions.CurrentPage.ID = currentURLId;
    }
    if (sourceURLId) {
      whereConditions.SourcePage = whereConditions.SourcePage || {};
      whereConditions.SourcePage.ID = sourceURLId;
    }
    if (Id) {
      whereConditions.ID = Id;
    }

    console.log(whereConditions);

    const clientRepository = DBConnection.getRepository(ClientData);
    const totalCount = await clientRepository.count();
    const totalPages = Math.ceil(totalCount / pageSize);
    const currentPage = page;

    //const clientData = await clientRepository.find();
    logger.info(`Client fetching data`);
    const clientData = await clientRepository
      .createQueryBuilder("ClientData")
      .leftJoinAndSelect("ClientData.CurrentPage", "currentPage")
      .leftJoinAndSelect("ClientData.SourcePage", "sourcePage")
      .leftJoinAndSelect("ClientData.Company", "company")
      .where(whereConditions)
      .andWhere(
        new Brackets((qb) => {
          if (url) {
            qb.andWhere(
              "CurrentPage.Adress LIKE :url OR SourcePage.Adress LIKE :url",
              { url: `%${url}%` }
            );
          }
        })
      )
      .orderBy("ClientData.ID", "DESC")
      .skip(skip)
      .take(pageSize)
      .getMany();
    res.json({ currentPage, totalPages, pageSize, clientData });
  } catch (error) {
    next(new CustomError((error as Error).message, 400));
  }
};

export { uploadRoute, getDataRoute };
