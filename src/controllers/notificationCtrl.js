import { Notification } from '../models/index.js';

async function getAll(req, res) {
  try {
    const user = req.user;

    const notificationList = await Notification.find({ userId: user._id }).lean();

    res.send(notificationList);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function setRead(req, res) {
  try {
    const { data } = req.body;

    for (const notification of data) {
      await Notification.findByIdAndUpdate(notification._id, {
        $set: { read: notification.setTo },
      }).lean();
    }

    res.sendStatus(200);
  } catch (error) {
    res.status(500).json(error);
  }
}

const notificationCtrl = {
  getAll,
  setRead,
};

export default notificationCtrl;
