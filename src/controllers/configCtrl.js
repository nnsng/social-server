import Post from '../models/Post.js';

async function getTopHashtags(req, res) {
  try {
    const postHashtags = await Post.find({}).select('hashtags').lean();
    const quantities = postHashtags
      .reduce((acc, cur) => [...acc, ...cur.hashtags], [])
      .reduce((acc, cur) => {
        acc[cur] = (acc[cur] || 0) + 1;
        return acc;
      }, {});

    const topHashtags = Object.entries(quantities)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map((x) => x[0]);

    res.send(topHashtags);
  } catch (error) {
    res.status(500).send(error);
  }
}

const configCtrl = {
  getTopHashtags,
};

export default configCtrl;
