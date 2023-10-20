require("dotenv").config();
import express from "express";
import cors from "cors";

import { notFound, errorHandler } from "./middlewares";
import api from "./api";
import MessageResponse from "./interfaces/MessageResponse";

const app = express();

app.use(cors());
app.use(express.json());

// TODO luo tietokanta yhteys

app.use("/uploads", express.static("uploads"));

app.get<{}, MessageResponse>("/", (req, res) => {
  res.json({
    message: "API location: api/v1",
  });
});

app.use("/api/v1", api);

app.use(notFound);
app.use(errorHandler);

export default app;
