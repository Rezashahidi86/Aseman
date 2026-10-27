import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^09\d{9}$/, 'Invalid phone number'],
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

customerSchema.index(
  { branch: 1, phone: 1 },
  { unique: true, name: 'unique_customer_phone_per_branch' },
);

customerSchema.index({ branch: 1, name: 1 });

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;