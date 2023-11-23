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
import { ILike, Like } from "typeorm";

//haku firman nimellä
//haku firman id:llä
//autofill characterlimit esim 3
//hausta pois ettei välitetä isoista ja pienistä kirjaimista eikä välilyönneistä yms

const ITEMS_PER_PAGE = 2;

const getCompanyRoute = async (
  req: Request,
  res: Response<{}, {}>,
  next: NextFunction
) => {
  try {
  
    const clientRepository = DBConnection.getRepository(Company);
    let clientByName;
    

    let clientById; 
    const name = req.query.name as string;
    const id = parseInt(req.query.id as string, 10);


    //Etsii nimen, jos vähintään 3 kirjainta etsii kaikki mitkä kaksi täsmäävät, jos vähemmän etsii vain täsmäävät alkukirjaimet 
    if(name.length > 2){
      console.log(name);
      

      clientByName = await clientRepository.find({ where: { NAME: ILike(`%${name}%`) } });
    } else if (name && name.length <= 2){
      console.log(name);
  
      clientByName = await clientRepository.find({ where: { NAME: ILike(`${name}%`) } });
    }
    if(id){
      console.log(id);
      clientById = await clientRepository.findOne({ where: { ID: id } });
    }
 
    res.json({ clientById, clientByName });
  } catch (error) {
    next(new CustomError((error as Error).message, 400));
  }
};

export { getCompanyRoute };
