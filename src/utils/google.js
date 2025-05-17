import { OAuth2Client } from 'google-auth-library';
import { env } from './env.js';

export const getGoogleUserInfo = async (accessToken) => {
  const oauth2Client = new OAuth2Client({ clientId: env.GOOGLE_CLIENT_ID });

  oauth2Client.setCredentials({
    access_token: accessToken,
  });

  const url = 'https://www.googleapis.com/oauth2/v3/userinfo';
  const res = await oauth2Client.request({ url });

  return res.data;
};
