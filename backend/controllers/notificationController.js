import User from "../models/userModel.js";

export const getUserNotification = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    const unreadNotifications = user.notifications
      .filter(notification => !notification.read)
      .sort((a, b) => b.createdAt - a.createdAt);

    return res.status(201).json(unreadNotifications);
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {$set: {"notifications.$[].read": true}},
      {new: true}
    );
    return res.status(200).json(user.notifications);
  } catch (error) {
    next(error);
  }
};

export const clearNotifications = async (req, res, next) => {
  try {
    await User.updateMany({}, {notifications: []});
    return res.status(200).json({message: "All Notifications removed successfully"});
  } catch (error) {
    next(error);
  }
};
