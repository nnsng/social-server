import bcrypt from 'bcryptjs';

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

export function randomNumber() {
  return (Math.floor(Math.random() * 1000) + 1).toString().padStart(3, '0');
}

export function generateRegexFilter(key, value) {
  return {
    [key]: {
      $regex: new RegExp(value),
      $options: 'i',
    },
  };
}
