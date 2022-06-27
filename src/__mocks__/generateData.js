import fs from 'fs';
import path from 'path';
import { hashPassword } from '../utils/common.js';
import mockData from './data_init.js';

(async () => {
  const filePath = path.join('src/__mocks__', 'data.js');
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  const newData = await Promise.all(
    mockData.map(async ({ post, user }) => {
      const hashedPassword = await hashPassword(user.password);
      const item = {
        post: {
          ...post,
          thumbnail: post.thumbnail ?? '',
          hashtags: [...new Set([post.hashtag1, post.hashtag2, post.hashtag3])]
            .filter((x) => !!x)
            .map((x) => x.toLowerCase()),
        },
        user: {
          ...user,
          username: user.email.split('@')[0],
          password: hashedPassword,
        },
      };

      delete item.post.hashtag1;
      delete item.post.hashtag2;
      delete item.post.hashtag3;

      return item;
    })
  );

  const content = `export default ${JSON.stringify(newData)};`;

  fs.writeFileSync(filePath, content);
})();
