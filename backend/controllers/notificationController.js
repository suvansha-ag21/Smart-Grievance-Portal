const Notification = require("../models/Notification");
const { getIsConnected } = require("../config/db");

let inMemoryNotifications = [];

// Get User Notifications
const getNotifications = async (req, res) => {
  try {
    if (getIsConnected()) {
      const list = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(30);
      return res.status(200).json(list);
    }

    const myNotes = inMemoryNotifications.filter(
      (n) => String(n.user?._id || n.user) === String(req.user._id)
    );
    res.status(200).json(myNotes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark Notification as Read
const markAsRead = async (req, res) => {
  try {
    if (getIsConnected()) {
      const note = await Notification.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        { isRead: true },
        { new: true }
      );
      if (note) return res.status(200).json(note);
    }

    const note = inMemoryNotifications.find((n) => String(n._id) === String(req.params.id));
    if (note) {
      note.isRead = true;
      return res.status(200).json(note);
    }

    res.status(404).json({ message: "Notification not found" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark All as Read
const markAllAsRead = async (req, res) => {
  try {
    if (getIsConnected()) {
      await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
      return res.status(200).json({ message: "All notifications marked as read" });
    }

    inMemoryNotifications.forEach((n) => {
      if (String(n.user?._id || n.user) === String(req.user._id)) {
        n.isRead = true;
      }
    });

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper: Create Notification
const createNotification = async ({ userId, message, type = "Complaint" }) => {
  try {
    if (getIsConnected()) {
      return await Notification.create({
        user: userId,
        message,
        type,
      });
    }

    const newNote = {
      _id: "notif_" + Date.now(),
      user: userId,
      message,
      type,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    inMemoryNotifications.unshift(newNote);
    return newNote;
  } catch (err) {
    console.error("Notification creation error", err);
    return null;
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  inMemoryNotifications,
};
