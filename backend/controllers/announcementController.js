const Announcement = require("../models/Announcement");
const Notification = require("../models/Notification");
const User = require("../models/User");

// In-memory announcements store fallback
let inMemoryAnnouncements = [];

// Create Announcement & broadcast notification to all citizens
const createAnnouncement = async (req, res) => {
  try {
    const { title, message, category = "Notice", priority = "Medium", targetWard } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required." });
    }

    let announcement;
    try {
      announcement = await Announcement.create({
        title,
        message,
        category,
        priority,
        targetWard: targetWard || "All Wards",
        createdBy: req.user?._id,
      });

      // Broadcast in-app notification to all registered citizens
      const citizens = await User.find({ role: { $in: ["client", "citizen"] } }).select("_id");
      if (citizens.length > 0) {
        const notifDocs = citizens.map((c) => ({
          user: c._id,
          message: `📢 Official Civic Notice: ${title} - ${message.slice(0, 90)}...`,
          type: "Announcement",
          isRead: false,
        }));
        await Notification.insertMany(notifDocs);
      }
    } catch (dbErr) {
      // Fallback in-memory announcement
      announcement = {
        _id: `ann-${Date.now()}`,
        title,
        message,
        category,
        priority,
        targetWard: targetWard || "All Wards",
        createdBy: { _id: req.user?._id, name: req.user?.name || "Civic Officer" },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      inMemoryAnnouncements.unshift(announcement);
    }

    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get All Announcements
const getAnnouncements = async (req, res) => {
  try {
    let announcements;
    try {
      announcements = await Announcement.find()
        .populate("createdBy", "name")
        .sort({ createdAt: -1 });
    } catch {
      announcements = inMemoryAnnouncements;
    }

    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update Announcement
const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        message: "Announcement not found",
      });
    }

    announcement.title = req.body.title || announcement.title;
    announcement.message = req.body.message || announcement.message;
    announcement.category = req.body.category || announcement.category;
    announcement.priority = req.body.priority || announcement.priority;

    await announcement.save();

    res.status(200).json(announcement);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete Announcement
const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        message: "Announcement not found",
      });
    }

    await announcement.deleteOne();

    res.status(200).json({
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
};
