import express from "express";
import { botFilter } from "../middlewares";
import { getDataRoute, uploadRoute } from "./routes/dataRoute";

const router = express.Router();

router.route("/data").post(botFilter, uploadRoute).get(botFilter, getDataRoute);

export default router;
