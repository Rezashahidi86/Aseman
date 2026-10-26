import mongoose from 'mongoose';

const saleItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    barcode: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: 'Quantity must be an integer',
      },
    },
    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    finalSalePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    lineProfit: {
      type: Number,
      required: true,
    },
  },
  {
    _id: false,
  },
);

const saleSchema = new mongoose.Schema(
  {
    idempotencyKey: {
      type: String,
      required: true,
      trim: true,
      immutable: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
      immutable: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
    },
    items: {
      type: [saleItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: 'Sale must contain at least one item',
      },
    },
    totalSales: {
      type: Number,
      required: true,
      min: 0,
    },
    totalProfit: {
      type: Number,
      required: true,
    },
    totalItemsSold: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: 'Total items sold must be an integer',
      },
    },
  },
  {
    timestamps: true,
  },
);

saleSchema.index(
  { idempotencyKey: 1 },
  { unique: true, name: 'unique_sale_idempotency_key' },
);

saleSchema.index({ branch: 1, createdAt: -1 });

const Sale = mongoose.model('Sale', saleSchema);

export default Sale;