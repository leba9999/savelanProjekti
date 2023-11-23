import express from "express";

import { botFilter } from "../middlewares/botFilter";
import { getDataRoute, uploadRoute } from "./routes/dataRoute";
import { sanitizeBody } from "../middlewares/sanitizeBody";
import {
  botFilterPostRoute,
  botFilterDeleteRoute,
  botFilterGetRoute,
} from "./routes/botFilterRoute";
import { getCompanyRoute } from "./routes/companyRoute";
import { getUrlRoute } from "./routes/urlRoute";


const router = express.Router();

router.route("/data").post(botFilter, uploadRoute).get(botFilter, getDataRoute);
router.route("/company").get(getCompanyRoute);
router.route("/url").get(getUrlRoute);
router
  .route("/botData")
  .post(botFilterPostRoute)
  .get(botFilterGetRoute)
  .delete(botFilterDeleteRoute);

export default router;
