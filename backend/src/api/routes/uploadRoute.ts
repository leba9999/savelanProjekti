import { Request, Response, NextFunction } from "express";
import CustomError from "../../classes/CustomError";

const uploadRoute = async (
  req: Request,
  res: Response<{}, {}>,
  next: NextFunction
) => {
  try {
    console.log(req.body);
    res.json({
      message: "Upload route works",
    });
  } catch (error) {
    next(new CustomError((error as Error).message, 400));
  }
};

export { uploadRoute };
