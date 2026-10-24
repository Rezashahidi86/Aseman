import mongoose from "mongoose";
import AppError from "./AppError.js";

const validateMongoId = (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Invalid MongoDB ID", 400);
  }

  return id;
};

export default validateMongoId;