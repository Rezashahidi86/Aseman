import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Branch name is required'],
    trim: true,
  },
  code: {
    type: String,
    required: [true, 'Branch code is required'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  customerWelcomeSmsMessage: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Branch = mongoose.model('Branch', branchSchema);

export default Branch;
