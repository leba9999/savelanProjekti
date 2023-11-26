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
import { ILike } from "typeorm";
import { makeKeysCaseInsensitive } from "../../util/helpers";

const ITEMS_PER_PAGE = 2;

const getUrlRoute = async (
  req: Request,
  res: Response<{}, {}>,
  next: NextFunction
) => {
  try {
    const query = makeKeysCaseInsensitive(req.query);
    const urlRepository = DBConnection.getRepository(URL);
    let clientUrl = [] as URL[];
    if (query.id) {
      clientUrl = [
        (await urlRepository.findOne({
          where: { ID: query.id },
        })) || ({} as URL),
      ];
    } else {
      clientUrl = (await urlRepository.find({})) || ({} as URL);
    }

    res.json(clientUrl);
  } catch (error) {
    next(new CustomError((error as Error).message, 400));
  }
};

const getURLs = async (
  req: Request,
  res: Response<{}, {}>,
  next: NextFunction
) => {
  try {
    const query = makeKeysCaseInsensitive(req.query);
    let page = parseInt(query.page as string, 10) || (1 as number);
    let pageSize = parseInt(query.pagesize as string, 10) || (20 as number);

    const urlRepository = DBConnection.getRepository(URL);
    const totalCount = await urlRepository.count();
    const totalPages = Math.ceil(totalCount / pageSize);
    const currentPage = page;
    // Calculate the skip (offset) based on the page number
    const skip = (page - 1) * pageSize;

    const urls = await urlRepository
      .createQueryBuilder("url")
      .orderBy("url.Adress", "ASC")
      .skip(skip)
      .take(pageSize)
      .getMany();
    res.json({ currentPage, totalPages, pageSize, urls });
  } catch (error) {
    next(new CustomError((error as Error).message, 400));
  }
};

const getAutocompleteUrl = async (
  req: Request,
  res: Response<{}, {}>,
  next: NextFunction
) => {
  try {
    const urlRepository = DBConnection.getRepository(URL);
    const adress = req.query.adress as string;
    let urlSuggestions = [] as URL[];

    urlSuggestions = await urlRepository.find({
      where: { Adress: ILike(`%${adress}%`) },
      take: 5,
    });

    res.json(urlSuggestions);
  } catch (error) {
    next(new CustomError((error as Error).message, 400));
  }
};

export { getUrlRoute, getAutocompleteUrl, getURLs };
