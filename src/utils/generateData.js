import fs from 'fs';
import path from 'path';
import mockData from '../__mocks__/mock_data.js';
import { randomNumber } from './common.js';

(() => {
  const filePath = path.join('src/__mocks__', 'output_data.js');
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  const newData = mockData.map((data) => {
    const item = {
      ...data,
      thumbnail: data.thumbnail ?? '',
      hashtags: [...new Set([data.hashtag1, data.hashtag2, data.hashtag3])]
        .filter((x) => !!x)
        .map((x) => x.toLowerCase()),
      author: {
        ...data.author,
        username: data.author.name.toLowerCase().replace(/\s+/g, '-') + randomNumber(),
      },
    };

    delete item.hashtag1;
    delete item.hashtag2;
    delete item.hashtag3;

    return item;
  });

  const content = `export default ${JSON.stringify(newData)};`;

  fs.writeFileSync(filePath, content);
})();
