import { Request, Response, NextFunction } from "express";
import CustomError from "../../classes/CustomError";
import { ClientData } from "../../entities/clientData.entity";
import { URL } from "../../entities/url.entity";
import { Company } from "../../entities/company.entity";
import { DBConnection } from "../../util/data-source";
import TrackerData from "../../interfaces/TrackerData";

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
    const trackerData = req.body as TrackerData;
    console.log(trackerData);
    console.log(Date.now());

    const urlData = new URL();
    const referrerData = new URL();
    urlData.Adress = trackerData.url;
    referrerData.Adress = trackerData.referrer;

    const companyData = new Company();
    companyData.IP = trackerData.ip || "0.0.0.0";
    companyData.NAME = "Testi Yritys OY"; // fetch from IP database

    const clientData = new ClientData();
    clientData.Company = companyData;
    clientData.CurrentPage = urlData;
    clientData.TimeStamp = trackerData.timestamp;
    clientData.UserAgent = trackerData.user_agent;

    const clientRepository = DBConnection.getRepository(ClientData);
    const savedData = await clientRepository.save(clientData);
    console.log(savedData);
    res.json(savedData);
  } catch (error) {
    next(new CustomError((error as Error).message, 400));
  }
};

export { uploadRoute };
