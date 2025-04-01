import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employmentStatus: {
    type: String,
    required: true,
    enum: ['full-time', 'part-time', 'self-employed', 'unemployed']
  },
  annualIncome: {
    type: Number,
    required: true,
    min: 0
  },
  currentAddress: {
    type: String,
    required: true
  },
  previousLandlord: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true }
  },
  reasonForMoving: {
    type: String,
    required: true
  },
  additionalNotes: {
    type: String
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
applicationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Application = mongoose.models.Application || mongoose.model('Application', applicationSchema);

export default Application; 