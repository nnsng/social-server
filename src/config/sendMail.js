import { OAuth2Client } from 'google-auth-library';
import nodemailer from 'nodemailer';
import { env, variables } from '../utils/env.js';

export const sendMailTypes = {
  activeAccount: 'activeAccount',
  resetPassword: 'resetPassword',
};

async function sendMail(mailto, url, type) {
  const OAUTH_PLAYGROUND = 'https://developers.google.com/oauthplayground';

  const clientId = env(variables.googleClientId);
  const clientSecret = env(variables.googleClientSecret);
  const refreshToken = env(variables.googleRefreshToken);
  const senderMail = env(variables.senderEmailAddress);

  try {
    const oAuth2Client = new OAuth2Client(clientId, clientSecret, OAUTH_PLAYGROUND);

    oAuth2Client.setCredentials({ refresh_token: refreshToken });

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

    const subjects = {
      activeAccount: 'Active account',
      resetPassword: 'Reset password',
    };

    const mailOptions = {
      from: senderMail,
      to: mailto,
      subject: subjects[type],
      html: generateHtml(url, type),
    };

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.log('sendMail', error);
  }
}

function generateHtml(url, type) {
  const isActive = type === sendMailTypes.activeAccount;

  const title = isActive ? 'Welcome to 1social' : 'Reset password';
  const description = isActive
    ? 'Click the button below to validate your email address.'
    : 'Click the button below to reset your password.';
  const buttonLabel = isActive ? 'Active' : 'Reset';

  return `
    <div style="border: 10px solid #ddd; padding: 40px 28px; font-size: 110%;">
      <h2 style="text-align: center; text-transform: uppercase; color: #7575FF; margin-bottom: 28px;">
        ${title}
      </h2>

      <p>${description}</p>
      
      <div style="display: flex; align-items: center; justify-content: center;">
        <a href=${url} style="background: #7575FF; text-decoration: none; color: white; padding: 8px 20px; margin: 10px 0; display: inline-block; text-transform: uppercase; border-radius: 4px;">
          ${buttonLabel}
        </a>
      </div>

      <p>If the button doesn't work, you can also click on the link below:</p>
          
      <a href=${url} style="text-decoration: underline;">${url}</a>
    </div>
  `;
}

export default sendMail;
