import mongoose from 'mongoose';

const manualDocumentSchema = new mongoose.Schema(
  {
    note: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    documentDetails: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (images) => images.length <= 10,
        message: 'You can upload up to 10 images',
      },
    }
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
  },
  {
    timestamps: true,
  },
);

manualDocumentSchema.index({ branch: 1, createdAt: -1 });

const ManualDocument = mongoose.model('ManualDocument', manualDocumentSchema);

export default ManualDocument;
