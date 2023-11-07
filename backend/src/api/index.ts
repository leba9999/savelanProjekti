import express from "express";


import { botFilter } from "../middlewares/botFilter";
import { getDataRoute, uploadRoute } from "./routes/dataRoute";
import { sanitizeBody } from "../middlewares/sanitizeBody";
import { botFilterPostRoute, botFilterDeleteRoute, botFilterGetRoute } from "./routes/botFilterRoute";

const router = express.Router();

router
  .route("/data")
  .post(sanitizeBody, botFilter, uploadRoute)
  .get(botFilter, getDataRoute);
router.route("/botData")
.post(botFilterPostRoute)
.get(botFilterGetRoute)
.delete(botFilterDeleteRoute);
                        

export default router;
