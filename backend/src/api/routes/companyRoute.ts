import e, { Request, Response, NextFunction } from "express";
import CustomError from "../../classes/CustomError";
import { Company } from "../../entities/company.entity";
import { DBConnection } from "../../util/data-source";
import logger from "../../util/loggers";
import { ILike, Like } from "typeorm";
import { makeKeysCaseInsensitive } from "../../util/helpers";

const getAutocompleteCompany = async (
  req: Request,
  res: Response<{}, {}>,
  next: NextFunction
) => {
  try {
    const companyRepository = DBConnection.getRepository(Company);
    let companySuggestions = [] as Company[];
    const name = req.query.name as string;

    //Etsii nimen, jos vähintään 3 kirjainta etsii kaikki mitkä kaksi täsmäävät, jos vähemmän etsii vain täsmäävät alkukirjaimet
    if (name.length > 2) {
      console.log(name);

      companySuggestions = await companyRepository.find({
        where: { Name: ILike(`%${name}%`) },
        take: 5,
      });
    } else if (name && name.length <= 2) {
      console.log(name);

      companySuggestions = await companyRepository.find({
        where: { Name: ILike(`${name}%`) },
        take: 5,
      });
    }

    res.json(companySuggestions);
  } catch (error) {
    next(new CustomError((error as Error).message, 400));
  }
};

const getCompanies = async (
  req: Request,
  res: Response<{}, {}>,
  next: NextFunction
) => {
  try {
    const query = makeKeysCaseInsensitive(req.query);
    let page = parseInt(query.page as string, 10) || (1 as number);
    let pageSize = parseInt(query.pagesize as string, 10) || (20 as number);

    const companyRepository = DBConnection.getRepository(Company);
    const totalCount = await companyRepository.count();
    const totalPages = Math.ceil(totalCount / pageSize);
    const currentPage = page;
    // Calculate the skip (offset) based on the page number
    const skip = (page - 1) * pageSize;

    const companies = await companyRepository
      .createQueryBuilder("company")
      .orderBy("company.Name", "ASC")
      .skip(skip)
      .take(pageSize)
      .getMany();
    res.json({ currentPage, totalPages, pageSize, companies });
  } catch (error) {
    next(new CustomError((error as Error).message, 400));
  }
};

const getCompanyData = async (
  req: Request,
  res: Response<{}, {}>,
  next: NextFunction
) => {
  try {
    const companyRepository = DBConnection.getRepository(Company);
    const id = parseInt(req.query.id as string, 10);
    const companyById =
      (await companyRepository.findOne({ where: { ID: id } })) ||
      ({} as Company);
    res.json(companyById);
  } catch (error) {
    next(new CustomError((error as Error).message, 400));
  }
};

export { getAutocompleteCompany, getCompanyData, getCompanies };
