import mongoose from 'mongoose';

const needSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    requestedQuantity: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: 'Requested quantity must be an integer',
      },
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'FULFILLED', 'REJECTED'],
      default: 'PENDING',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

needSchema.index({ branch: 1, status: 1, createdAt: -1 });
needSchema.index({ branch: 1, product: 1 });

const Need = mongoose.model('Need', needSchema);

export default Need;
