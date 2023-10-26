import { DataSource } from "typeorm";
import { Company } from "../entities/company.entity";
import { URL } from "../entities/url.entity";
import { ClientData } from "../entities/clientData.entity";
import logger from "../util/loggers";

export const DBConnection = new DataSource({
  type: "mysql",
  host: process.env.HOST,
  port: 3306,
  username: process.env.USER,
  password: process.env.PASS,
  database: process.env.DATABASE,
  synchronize: true,
  logging: false,
  entities: [ClientData, Company, URL],
  subscribers: [],
  migrations: [],
});
