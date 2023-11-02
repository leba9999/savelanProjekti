import express from "express";

//import uploadRoute from './routes/uploadRoute';
import MessageResponse from "../interfaces/MessageResponse";
import { botFilter } from "../middlewares/botFilter";
import { uploadRoute } from "./routes/uploadRoute";
import { botFilterPostRoute, botFilterDeleteRoute, botFilterGetRoute } from "./routes/botFilterRoute";

const router = express.Router();

// Tietokanta yhteyksiä ei tänne tarvitse laittaa
router.route("/").post(botFilter, uploadRoute);
router.route("/botData")
.post(botFilterPostRoute)
.get(botFilterGetRoute)
.delete(botFilterDeleteRoute);
                        

export default router;
