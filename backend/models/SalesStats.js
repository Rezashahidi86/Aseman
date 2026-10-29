import mongoose from 'mongoose';

const salesStatsSchema = new mongoose.Schema(
  {
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    periodType: {
      type: String,
      enum: ['daily', 'monthly'],
      required: true,
    },
    periodKey: {
      type: String,
      required: true,
      match: [/^\d{4}-(\d{2}|\d{2}-\d{2})$/, 'Invalid period key'],
    },
    totalSales: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    totalProfit: {
      type: Number,
      required: true,
      default: 0,
    },
    totalItemsSold: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Total items sold must be an integer',
      },
    },
    salesCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Sales count must be an integer',
      },
    },
  },
  {
    timestamps: true,
  },
);

salesStatsSchema.index(
  { branch: 1, periodType: 1, periodKey: 1 },
  { unique: true },
);

const SalesStats = mongoose.model('SalesStats', salesStatsSchema);

export default SalesStats;