import nodemailer from 'nodemailer';
import { env } from './env.js';

const googleEmailAddress = env.GOOGLE_EMAIL_ADDRESS;
const googleAppPassword = env.GOOGLE_APP_PASSWORD;

export const sendMailTypes = {
  activeAccount: 'activeAccount',
  resetPassword: 'resetPassword',
};

const sendMail = async ({ mailto, url, type }) => {
  try {
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: googleEmailAddress,
        pass: googleAppPassword,
      },
    });

    const subjects = {
      activeAccount: 'Active account',
      resetPassword: 'Reset password',
    };

    const mailOptions = {
      from: googleEmailAddress,
      to: mailto,
      subject: subjects[type],
      html: generateHtml(url, type),
    };

    await transport.sendMail(mailOptions);
  } catch (error) {
    console.log('sendMail', error);
    throw error;
  }
};

const generateHtml = (url, type) => {
  const titles = {
    activeAccount: 'Welcome to 1social.',
    resetPassword: 'Reset password',
  };

  const descriptions = {
    activeAccount: 'Click the button below to validate your email address.',
    resetPassword: 'Click the button below to reset your password.',
  };

  const buttonLabels = {
    activeAccount: 'Active',
    resetPassword: 'Reset',
  };

  const mainColor = '#FF652F';

  return `
    <div style="border: 10px solid #ddd; padding: 40px 28px; font-size: 110%; border-radius: 8px;">
      <h2 style="text-align: center; text-transform: uppercase; color: ${mainColor}; margin-bottom: 28px;">
        ${titles[type]}
      </h2>

      <p style="color: #333;">${descriptions[type]}</p>

      <div style="display: flex; align-items: center; justify-content: center;">
        <a href=${url} style="background: ${mainColor}; text-decoration: none; color: white; padding: 8px 20px; margin: 10px 0; display: inline-block; text-transform: uppercase; border-radius: 4px;">
          ${buttonLabels[type]}
        </a>
      </div>

      <p style="color: #333;">If the button doesn't work, you can also click on the link below:</p>

      <a href=${url} style="text-decoration: underline; color: ${mainColor}">${url}</a>
    </div>
  `;
};

export default sendMail;
