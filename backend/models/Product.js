import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
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
    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    salePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Quantity must be an integer',
      },
    },
    minimumStock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Minimum stock must be an integer',
      },
    },
    salesCount: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Sales count must be an integer',
      },
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

productSchema.index({ branch: 1, barcode: 1 }, { unique: true });
productSchema.index({ branch: 1, name: 1 }, { unique: true });
productSchema.index({ branch: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
