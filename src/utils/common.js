import bcrypt from 'bcryptjs';

export async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

export function randomNumber(start, end) {
  return Math.floor(Math.random() * (end - start)) + start;
}

export function generateRegexFilter(key, value) {
  return {
    [key]: {
      $regex: new RegExp(value),
      $options: 'i',
    },
  };
}
