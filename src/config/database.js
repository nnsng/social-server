import mongoose from 'mongoose';

export function connectToDatabase(uri) {
  return mongoose.connect(uri, { useUnifiedTopology: true });
}
