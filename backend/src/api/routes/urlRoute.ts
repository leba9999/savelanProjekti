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
import { Not } from "typeorm";


const ITEMS_PER_PAGE = 2;

const getUrlRoute = async (
  req: Request,
  res: Response<{}, {}>,
  next: NextFunction
) => {
  try {
  


    const clientRepository = DBConnection.getRepository(URL);
    let clientUrl = await clientRepository.find({ });
  

    res.json({ clientUrl});
  } catch (error) {
    next(new CustomError((error as Error).message, 400));
  }
};

export { getUrlRoute };