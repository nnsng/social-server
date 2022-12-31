const errors = {
  post: {
    create: 'Failed to create post',
    update: 'Failed to update post',
    notFound: 'Post not found',
    saved: 'Post already saved',
    notSaved: 'Post have not saved yet',
    notAllowedToEdit: 'You are not allowed to edit this post',
    notAllowedToDelete: 'You are not allowed to delete this post',
  },
  comment: {
    notFound: 'Comment not found',
    notAllowedToEdit: 'You are not allowed to edit this comment',
    notAllowedToDelete: 'You are not allowed to delete this comment',
  },
  auth: {
    accessDenied: 'Access denied',
    invalidToken: 'Invalid token',
    invalidAuth: 'Invalid authentication',
    emailNotRegister: 'Email have not registered yet',
    emailExist: 'Email already exist',
    notActive: 'Account have not activated yet',
    alreadyActive: 'Account already activated',
    usernameExist: 'Username already exist',
    passwordNotCorrect: 'Password not correct',
  },
  user: {
    notFound: 'User not found',
    cannotChangeEmail: 'Cannot change email',
    alreadyFollow: 'You already follow this user',
    notFollow: 'You have not follow this user yet',
  },
};

export function generateErrorResponse(name) {
  const keys = name.split('.');

  const message = keys.reduce((acc, key) => acc[key], errors);

  return {
    name,
    message: message ?? 'Something went wrong',
  };
}
