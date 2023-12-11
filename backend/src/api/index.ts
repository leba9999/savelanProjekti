import express from "express";

import { botFilter } from "../middlewares/botFilter";
import { getDataRoute, uploadRoute } from "./routes/dataRoute";
import {
  botFilterPostRoute,
  botFilterDeleteRoute,
  botFilterGetRoute,
} from "./routes/botFilterRoute";
import {
  getAutocompleteCompany,
  getCompanyData,
  getCompanies,
} from "./routes/companyRoute";
import { getAutocompleteUrl, getURLs, getUrlRoute } from "./routes/urlRoute";

const router = express.Router();

router.route("/data").post(botFilter, uploadRoute).get(getDataRoute);
router.route("/company/autocomplete").get(getAutocompleteCompany);
router.route("/company").get(getCompanyData);
router.route("/companies").get(getCompanies);
router.route("/url").get(getUrlRoute);
router.route("/urls").get(getURLs);
router.route("/url/autocomplete").get(getAutocompleteUrl);
router
  .route("/botData")
  .post(botFilterPostRoute)
  .get(botFilterGetRoute)
  .delete(botFilterDeleteRoute);

export default router;
