import dotenv from 'dotenv';

dotenv.config();

export const env = (variable) => {
  const value = process.env[variable];
  if (!value) throw new Error(`Env ${variable} is not defined.`);
  return value;
};

export const variables = {
  port: 'PORT',

  mongoUri: 'MONGODB_URI',

  activeTokenSecret: 'ACTIVE_TOKEN_SECRET',
  accessTokenSecret: 'ACCESS_TOKEN_SECRET',

  googleClientId: 'GOOGLE_CLIENT_ID',
  googleEmailAddress: 'GOOGLE_EMAIL_ADDRESS',
  googleAppPassword: 'GOOGLE_APP_PASSWORD',
};
