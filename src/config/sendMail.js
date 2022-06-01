import nodemailer from 'nodemailer';
import { env, variables } from '../utils/env.js';

const senderMailAddress = env(variables.senderEmailAddress);
const senderMailPassword = env(variables.senderEmailPassword);

export const sendMailTypes = {
  activeAccount: 'activeAccount',
  resetPassword: 'resetPassword',
};

async function sendMail(mailto, url, type) {
  try {
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: senderMailAddress,
        pass: senderMailPassword,
      },
    });

    const subjects = {
      activeAccount: 'Active account',
      resetPassword: 'Reset password',
    };

    const mailOptions = {
      from: senderMailAddress,
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
