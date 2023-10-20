import { Request, Response, NextFunction } from "express";
import CustomError from "../../classes/CustomError";
import TrackerData from "../../interfaces/TrackerData";

const uploadRoute = async (
  req: Request,
  res: Response<{}, {}>,
  next: NextFunction
) => {
  try {
    const trackerData = req.body as TrackerData; // Pluginilta tai postmaniltä tuleva data
    console.log(trackerData);

    // TODO: Tallennetaan trackerData tietokantaan esim Hannan kanssa katsottiin se con eli import con

    res.json({
      message: "Upload route works",
    });
  } catch (error) {
    next(new CustomError((error as Error).message, 400));
  }
};

export { uploadRoute };
