const errorMessages = {
  // auth
  accessDenied: 'Access denied.',
  invalidToken: 'Invalid token.',
  invalidAuthen: 'Invalid authentication.',

  userNotFound: 'User not found.',
  emailNotRegister: 'Email have not registered yet.',
  emailExist: 'Email already exist.',
  accountActive: 'Account already active.',
  usernameExist: 'Username already exist.',
  passwordNotCorrect: 'Password not correct.',
  cannotChangeEmail: 'Cannot change email.',
  alreadyFollow: 'Already follow this user.',
  notFollow: 'Have not follow this user yet.',

  // post / comment
  postSaved: 'Post already saved.',
  postNotSaved: 'Post have not saved yet.',
  postNotFound: 'Post not found.',
  notAllowedEditPost: 'You are not allowed to edit this post.',
  notAllowedDeletePost: 'You are not allowed to delete this post.',
  commentNotFound: 'Comment not found.',
  notAllowedEditComment: 'You are not allowed to edit this comment.',
  notAllowedDeleteComment: 'You are not allowed to delete this comment.',
};

export function generateErrorObject(name) {
  return {
    name,
    message: errorMessages[name],
  };
}
