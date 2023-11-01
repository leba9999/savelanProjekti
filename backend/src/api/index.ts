import express from "express";
import { botFilter } from "../middlewares";
import { getDataRoute, uploadRoute } from "./routes/dataRoute";
import { sanitizeBody } from "../middlewares/sanitizeBody";

const router = express.Router();

router
  .route("/data")
  .post(sanitizeBody, botFilter, uploadRoute)
  .get(botFilter, getDataRoute);

export default router;
