import mongoose from 'mongoose';

export const connectToDatabase = (uri) => {
  return mongoose.connect(uri, { useUnifiedTopology: true });
};
