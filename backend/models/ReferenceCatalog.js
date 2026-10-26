import mongoose from 'mongoose';

const referenceCatalogSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    barcode: {
      type: String,
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
  },
  {
    timestamps: true,
  },
);

referenceCatalogSchema.index({ name: 1 }, { unique: true });
referenceCatalogSchema.index({ barcode: 1 }, { unique: true });

const ReferenceCatalog = mongoose.model(
  'ReferenceCatalog',
  referenceCatalogSchema,
);

export default ReferenceCatalog;
