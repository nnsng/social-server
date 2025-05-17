import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().optional(),
  MONGODB_URI: z.string().url(),
  ACTIVE_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_EMAIL_ADDRESS: z.string().email(),
  GOOGLE_APP_PASSWORD: z.string(),
});

export const env = envSchema.parse(process.env);
