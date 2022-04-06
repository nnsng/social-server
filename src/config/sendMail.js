import { OAuth2Client } from 'google-auth-library';
import nodemailer from 'nodemailer';
import { env, variables } from '../utils/env.js';

const OAUTH_PLAYGROUND = 'https://developers.google.com/oauthplayground';

const clientId = env(variables.googleClientId);
const clientSecret = env(variables.googleClientSecret);
const refreshToken = env(variables.googleRefreshToken);
const senderMail = env(variables.senderEmailAddress);

async function sendMail(mailto, url) {
  const oAuth2Client = new OAuth2Client(clientId, clientSecret, OAUTH_PLAYGROUND);

  oAuth2Client.setCredentials({ refresh_token: refreshToken });

  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: senderMail,
        clientId,
        clientSecret,
        refreshToken,
        accessToken,
      },
    });

    const mailOptions = {
      from: senderMail,
      to: mailto,
      subject: 'Active account',
      html: `
              <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
                <h2 style="text-align: center; text-transform: uppercase; color: teal;">
                  Welcome to 1social
                </h2>

                <p>
                  Congratulations! You're almost set to start using <b>1social</b>.
                  Just click the button below to validate your email address.
                </p>
                
                <a href=${url} style="background: crimson; text-decoration: none; color: white; padding: 8px 20px; margin: 10px 0; display: inline-block;">
                Active
                </a>
              </div>
            `,
    };

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.log('sendMail', error);
  }
}

export default sendMail;
