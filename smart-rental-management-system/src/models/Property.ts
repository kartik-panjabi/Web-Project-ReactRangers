import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  propertyType: {
    type: String,
    required: true,
    enum: ['apartment', 'house', 'condo', 'townhouse']
  },
  rent: {
    type: Number,
    required: true,
    min: 0
  },
  bedrooms: {
    type: Number,
    required: true,
    min: 0
  },
  bathrooms: {
    type: Number,
    required: true,
    min: 0
  },
  squareFootage: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true
  },
  amenities: [{
    type: String,
    enum: [
      'parking',
      'pool',
      'gym',
      'laundry',
      'elevator',
      'security',
      'furnished',
      'pet-friendly',
      'utilities-included'
    ]
  }],
  images: [{
    type: String,
    required: true
  }],
  status: {
    type: String,
    enum: ['available', 'rented', 'maintenance'],
    default: 'available'
  },
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currentTenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
propertySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Property = mongoose.models.Property || mongoose.model('Property', propertySchema);

export default Property;
