import { Request, Response, NextFunction } from "express";
import CustomError from "../../classes/CustomError";
import { ClientData } from "../../entities/clientData.entity";
import { URL } from "../../entities/url.entity";
import { Company } from "../../entities/company.entity";
import { DBConnection } from "../../util/data-source";
import TrackerData from "../../interfaces/TrackerData";
import axios from "axios";
import IPApiData from "../../interfaces/IPApiData";
import AxiosRateLimit from "axios-rate-limit";

// Create an Axios instance with a base URL
const api = axios.create({
  baseURL: `http://ip-api.com`,
});
// Create a rate-limited instance with a maximum of 40 requests per minute
// Because the IP API is free, we need to rate-limit our requests to avoid getting blocked
// 45 requests per minute is the maximum allowed by the IP API
const rateLimitedApi = AxiosRateLimit(api, {
  maxRequests: 40,
  perMilliseconds: 60000,
});
const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
const uploadRoute = async (
  req: Request,
  res: Response<{}, {}>,
  next: NextFunction
) => {
  try {
    if (!req.body) {
      const err = new CustomError("body not valid", 400);
      throw err;
    }

    const clientRepository = DBConnection.getRepository(ClientData);
    const companyRepository = DBConnection.getRepository(Company);
    const urlRepository = DBConnection.getRepository(URL);
    const trackerData = req.body as TrackerData;
    console.log(trackerData);
    console.log(Date.now());

    // Check if the IP exists in the Company table
    let existingCompany = await companyRepository.findOne({
      where: { IP: trackerData.ip },
    });
    if (!existingCompany) {
      // IP is not in the Company table; create a new Company record
      existingCompany = new Company();
      existingCompany.IP = "0.0.0.0"; // Default to 0.0.0.0 if the IP is not valid
      existingCompany.NAME = "Unknown"; // Default to Unknown if the IP is not valid or the API call fails
      if (ipv4Pattern.test(trackerData.ip)) {
        existingCompany.IP = trackerData.ip;
        let savedUnknownCompany = await companyRepository.save(existingCompany);
        rateLimitedApi
          .get(`/json/${trackerData.ip}`)
          .then(async (response) => {
            console.log(response.data as IPApiData);
            if (savedUnknownCompany) {
              savedUnknownCompany.NAME = response.data.org;
              savedUnknownCompany.IP = response.data.query;
              const savedData = await companyRepository.update(
                savedUnknownCompany.ID,
                savedUnknownCompany
              );
              console.log(savedData);
            }
          })
          .catch((error) => {
            console.error(error);
          });
      }
    }
    let existingURL = await urlRepository.findOne({
      where: { Adress: trackerData.url },
    });
    let existingReferrerURL = await urlRepository.findOne({
      where: { Adress: trackerData.referrer },
    });

    if (!existingReferrerURL) {
      // URL is not in the URL table; create a new URL record
      existingReferrerURL = new URL();
      existingReferrerURL.Adress = trackerData.referrer;
      // No need to save the URL here; TypeORM will handle it via cascading when saving the ClientData record.
    }

    if (!existingURL) {
      // URL is not in the URL table; create a new URL record
      existingURL = new URL();
      existingURL.Adress = trackerData.url;
      // No need to save the URL here; TypeORM will handle it via cascading when saving the ClientData record.
    }

    // Create the ClientData record
    const clientData = new ClientData();
    clientData.Company = existingCompany;
    clientData.CurrentPage = existingURL;
    clientData.SourcePage = existingReferrerURL;
    clientData.TimeStamp = trackerData.timestamp;
    clientData.UserAgent = trackerData.user_agent;

    // Save the ClientData record, which should cascade the changes to Company and URL if configured.
    const savedData = await clientRepository.save(clientData);
    console.log(savedData);
    res.json(savedData);
  } catch (error) {
    console.log(error);
    next(new CustomError((error as Error).message, 400));
  }
};

export { uploadRoute };
