const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      default: 'Notice',
    },

    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    expiryDate: Date,

isActive: {
   type:Boolean,
   default:true
}
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Announcement || mongoose.model("Announcement", announcementSchema);