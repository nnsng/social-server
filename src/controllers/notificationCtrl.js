import { Notification } from '../models/index.js';

async function getAll(req, res) {
  try {
    const user = req.user;

    const notificationList = await Notification.find({ userId: user._id })
      .sort({ createdAt: 'desc' })
      .lean();

    const mappedList = notificationList.reduce((mapped, notification) => {
      const { type, actionUser, moreInfo, updatedAt } = notification;
      const post = moreInfo?.post || {};

      const key = type === 'follow' ? type : `${type}_${post._id}`;
      mapped[key] = mapped[key] ?? {};
      mapped[key].type = type;
      mapped[key].postSlug = post.slug;
      mapped[key].actionUsers = [...(mapped[key]?.actionUsers ?? []), actionUser];
      if (!mapped[key].updatedAt) {
        mapped[key].updatedAt = updatedAt;
      }
      return mapped;
    }, {});

    res.send(Object.values(mappedList));
  } catch (error) {
    res.status(500).json(error);
  }
}

// async function setRead(req, res) {
//   try {
//     const { data } = req.body;

//     for (const notification of data) {
//       await Notification.findByIdAndUpdate(notification._id, {
//         $set: { read: notification.setTo },
//       }).lean();
//     }

//     res.sendStatus(200);
//   } catch (error) {
//     res.status(500).json(error);
//   }
// }

const notificationCtrl = {
  getAll,
  // setRead,
};

export default notificationCtrl;
