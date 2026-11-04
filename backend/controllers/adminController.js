const bcrypt = require("bcryptjs");
const Complaint = require("../models/Complaint");
const User = require("../models/User");
const Announcement = require("../models/Announcement");
const { getIsConnected } = require("../config/db");
const { inMemoryComplaints } = require("./complaintController");
const { inMemoryUsers } = require("./authController");

// ====================== Assign Officer ======================
const assignOfficer = async (req, res) => {
  try {
    const { complaintId, officerId } = req.body;

    if (getIsConnected()) {
      const complaint = await Complaint.findById(complaintId);
      if (complaint) {
        complaint.assignedOfficer = officerId;
        complaint.status = "Assigned";
        await complaint.save();
        return res.status(200).json({
          message: "Officer assigned successfully",
          complaint,
        });
      }
    }

    const item = inMemoryComplaints.find((c) => String(c._id) === String(complaintId));
    if (item) {
      const officer = inMemoryUsers.find((u) => String(u._id) === String(officerId));
      item.assignedOfficer = officer ? { _id: officer._id, name: officer.name, email: officer.email } : null;
      item.status = "Assigned";
      return res.status(200).json({
        message: "Officer assigned successfully",
        complaint: item,
      });
    }

    res.status(404).json({ message: "Complaint not found" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ====================== Get All Complaints ======================
const getAllComplaints = async (req, res) => {
  try {
    const { history, active } = req.query;

    if (getIsConnected()) {
      let filter = {};
      if (history === "true") {
        filter.$or = [{ isClosed: true }, { status: "Closed" }];
      } else if (active === "true") {
        filter.isClosed = { $ne: true };
        filter.status = { $ne: "Closed" };
      }

      const complaints = await Complaint.find(filter)
        .populate("citizen", "name email")
        .populate("department", "departmentName")
        .populate("assignedOfficer", "name email")
        .sort({ createdAt: -1 });

      return res.status(200).json(complaints);
    }

    let items = [...inMemoryComplaints];
    if (history === "true") {
      items = items.filter((c) => c.isClosed || c.status === "Closed");
    } else if (active === "true") {
      items = items.filter((c) => !c.isClosed && c.status !== "Closed");
    }

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ====================== Get All Users ======================
const getAllUsers = async (req, res) => {
  try {
    if (getIsConnected()) {
      const users = await User.find().select("-password");
      return res.status(200).json(users);
    }

    const sanitized = inMemoryUsers.map(({ passwordHash, ...rest }) => rest);
    res.status(200).json(sanitized);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ====================== Create Officer ======================
const createOfficer = async (req, res) => {
  try {
    const { name, email, password, phone, address, department } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    if (getIsConnected()) {
      const userExists = await User.findOne({ email: cleanEmail });
      if (userExists) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const officer = await User.create({
        name,
        email: cleanEmail,
        password: hashedPassword,
        phone,
        address,
        department,
        role: "officer",
      });

      return res.status(201).json({
        message: "Officer created successfully",
        officer: {
          _id: officer._id,
          name: officer.name,
          email: officer.email,
          role: officer.role,
          department: officer.department,
        },
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newOfficer = {
      _id: "officer_" + Date.now(),
      name,
      email: cleanEmail,
      passwordHash: hashedPassword,
      phone,
      address,
      department,
      role: "officer",
    };
    inMemoryUsers.push(newOfficer);

    res.status(201).json({
      message: "Officer created successfully",
      officer: {
        _id: newOfficer._id,
        name: newOfficer.name,
        email: newOfficer.email,
        role: newOfficer.role,
        department: newOfficer.department,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ====================== Announcements ======================
const DEFAULT_ANNOUNCEMENTS = [
  {
    _id: "ann_001",
    title: "Monsoon Preparedness Drainage Cleaning",
    message: "Special desilting and drain unclogging drive active in all wards. Report blockages immediately.",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "ann_002",
    title: "Streetlight LED Upgrades",
    message: "Municipal energy conservation drive converting older sodium lamps to smart LEDs in Sectors 11 through 18.",
    createdAt: new Date().toISOString(),
  },
];

let inMemoryAnnouncements = [...DEFAULT_ANNOUNCEMENTS];

const createAnnouncement = async (req, res) => {
  try {
    const { title, message } = req.body;
    if (getIsConnected()) {
      const announcement = await Announcement.create({
        title,
        message,
        createdBy: req.user._id,
      });
      return res.status(201).json(announcement);
    }

    const ann = { _id: "ann_" + Date.now(), title, message, createdAt: new Date().toISOString() };
    inMemoryAnnouncements.unshift(ann);
    res.status(201).json(ann);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAnnouncements = async (req, res) => {
  try {
    if (getIsConnected()) {
      const announcements = await Announcement.find().sort({ createdAt: -1 });
      if (announcements.length > 0) return res.status(200).json(announcements);
    }
    res.status(200).json(inMemoryAnnouncements);
  } catch (error) {
    res.status(200).json(inMemoryAnnouncements);
  }
};

const updateAnnouncement = async (req, res) => {
  try {
    const { title, message } = req.body;
    if (getIsConnected()) {
      const announcement = await Announcement.findById(req.params.id);
      if (announcement) {
        announcement.title = title || announcement.title;
        announcement.message = message || announcement.message;
        await announcement.save();
        return res.status(200).json({ message: "Announcement updated", announcement });
      }
    }

    const item = inMemoryAnnouncements.find((a) => a._id === req.params.id);
    if (item) {
      item.title = title || item.title;
      item.message = message || item.message;
      return res.status(200).json({ message: "Announcement updated", announcement: item });
    }
    res.status(404).json({ message: "Announcement not found" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    if (getIsConnected()) {
      const announcement = await Announcement.findById(req.params.id);
      if (announcement) {
        await announcement.deleteOne();
        return res.status(200).json({ message: "Announcement deleted" });
      }
    }

    inMemoryAnnouncements = inMemoryAnnouncements.filter((a) => a._id !== req.params.id);
    res.status(200).json({ message: "Announcement deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  assignOfficer,
  getAllComplaints,
  getAllUsers,
  createOfficer,
  createAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
};
