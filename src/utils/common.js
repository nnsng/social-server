import bcrypt from 'bcryptjs';

export const delay = async (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

export const randomNumber = (start, end) => {
  if (end < start) return 0;
  return Math.floor(Math.random() * (end - start)) + start;
};

export const generateRegexFilter = (key, value) => {
  return {
    [key]: {
      $regex: new RegExp(value),
      $options: 'i',
    },
  };
};
