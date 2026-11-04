const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    complaintNumber: {
      type: String,
      default: function () {
        return `GRV${Math.floor(100 + Math.random() * 900)}`;
      },
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: [
        "Draft",
        "Submitted — Awaiting Validation",
        "Needs More Information",
        "Under Manual Review",
        "Accepted and Assigned",
        "In Progress",
        "Resolved",
        "RESOLVED_AWAITING_FEEDBACK",
        "Closed",
        "Reopened",
        "Rejected",
        // Backward-compatibility legacy statuses:
        "Pending",
        "Assigned",
      ],
      default: "Submitted — Awaiting Validation",
    },

    isClosed: {
      type: Boolean,
      default: false,
      index: true,
    },

    closedAt: {
      type: Date,
      default: null,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },

    image: {
      type: String,
      default: "",
    },

    resolutionImage: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      required: true,
    },

    remarks: {
      type: String,
      default: "",
    },

    rejectionReason: {
      type: String,
      default: "",
    },

    aiFlag: {
      type: String,
      default: "Clean",
    },

    authenticityScore: {
      type: Number,
      default: 95,
    },

    evidenceAnalysis: {
      type: Object,
      default: () => ({
        imageIntegrity: "Verified Camera Capture",
        confidence: "High",
        duplicateRisk: "Low",
      }),
    },

    aiValidation: {
      type: Object,
      default: () => ({
        isValidCivic: true,
        classificationConfidence: 85,
        detectedCategory: "",
        recommendedDepartment: "",
        imageRelevance: "Relevant Evidence",
        duplicateProbability: 0,
        isPossibleDuplicate: false,
        matchingComplaints: [],
        warnings: [],
        explanation: "",
        recommendedAction: "Auto-Route & Assign",
        analyzedAt: new Date(),
      }),
    },

    citizenSatisfaction: {
      type: Object,
      default: () => ({
        confirmed: false,
        satisfied: null,
        feedbackRating: 0,
        feedbackComment: "",
        confirmedAt: null,
      }),
    },

    moreInfoRequested: {
      type: Object,
      default: () => ({
        requested: false,
        requestedAt: null,
        reason: "",
        citizenResponse: "",
        respondedAt: null,
      }),
    },

    resolutionDetails: {
      type: Object,
      default: () => ({
        remarks: "",
        resolutionImage: "",
        resolvedAt: null,
        resolvedBy: null,
      }),
    },

    feedback: {
      rating: { type: Number, default: 0 },
      comment: { type: String, default: "" },
      submittedAt: { type: Date, default: null },
    },

    reopenedAt: {
      type: Date,
      default: null,
    },

    reopenReason: {
      type: String,
      default: "",
    },

    analysisReasons: {
      type: [String],
      default: [],
    },

    timeline: [
      {
        title: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        description: { type: String, default: "" },
        completed: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true,
    strict: false,
  }
);

module.exports = mongoose.models.Complaint || mongoose.model("Complaint", complaintSchema);
