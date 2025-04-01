// src/lib/mongodb.ts
import mongoose from 'mongoose';

const connectMongo = async () => {
  try {
    // Connect to MongoDB using Mongoose
    await mongoose.connect(process.env.MONGODB_URI as string, {
     
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Failed to connect to MongoDB');
  }
};

export { connectMongo };