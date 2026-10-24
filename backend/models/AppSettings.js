import mongoose from "mongoose";

const appSettingsSchema = new mongoose.Schema(
  {
    lowStockThreshold: {
      type: Number,
      required: true,
      min: 0,
      default: 10,
    },
  },
  {
    timestamps: true,
  },
);

const AppSettings = mongoose.model("AppSettings", appSettingsSchema);

export default AppSettings;