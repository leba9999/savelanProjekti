import express from "express";

//import uploadRoute from './routes/uploadRoute';
import MessageResponse from "../interfaces/MessageResponse";
import { botFilter } from "../middlewares";
import { uploadRoute } from "./routes/uploadRoute";

const router = express.Router();

router.route("/").post(botFilter, uploadRoute);

export default router;
