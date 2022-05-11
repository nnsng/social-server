import fs from 'fs';
import path from 'path';
import { randomNumber } from './common.js';
import mockData from '../__mocks__/mockData.js';

(() => {
  const filePath = path.join('src/__mocks__', 'postData.js');
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  const data = mockData.map((post) => ({
    title: post.title,
    content: post.content,
    thumbnail: `https://picsum.photos/id/${post.thumbnailId}/600/400`,
    hashtags: [post.hashtags],
    authorId: post.authorId.$oid,
    author: {
      _id: post.authorId.$oid,
      name: post.author.name,
      avatar: post.author.avatar,
      username: post.author.name.toLowerCase().trim().replace(/\s+/g, '-') + randomNumber(),
      bio: post.author.bio,
    },
  }));

  const content = `
    const postData = ${JSON.stringify(data)};
    export default postData;
  `;

  fs.writeFileSync(filePath, content);
})();
