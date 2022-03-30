import mongoose from 'mongoose';

export async function connectToDatabase(uri) {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.log('Failed to connect to MongoDB');
    throw error;
  }
}
