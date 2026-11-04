const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    departmentName: {
      type: String,
      required: true,
      unique: true,
    },

    description: {
      type: String,
    },

    headOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isActive: {
    type: Boolean,
    default: true
}
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Department || mongoose.model("Department", departmentSchema);