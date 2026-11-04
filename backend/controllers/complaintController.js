const Complaint = require("../models/Complaint");
const Department = require("../models/Department");
const User = require("../models/User");
const { getIsConnected } = require("../config/db");
const { createNotification } = require("./notificationController");
const { validateCivicComplaint } = require("../utils/aiComplaintValidator");

let inMemoryComplaints = [];

// Helper to resolve Department model ID for a department name or keyword
async function resolveDepartment(deptName) {
  if (!deptName) deptName = "Other/Unclear";

  const cleanName = deptName.trim();
  // Try exact match or partial match
  let record = await Department.findOne({
    departmentName: { $regex: new RegExp(`^${cleanName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i") },
  });

  if (!record) {
    // Try matching canonical keywords
    let search = "Other Civic Issue";
    if (/road|pothole|footpath/i.test(cleanName)) search = "Roads Department";
    else if (/water|leak|pipeline|drain/i.test(cleanName)) search = "Water Supply Department";
    else if (/garbage|trash|sanitation|waste/i.test(cleanName)) search = "Sanitation Department";
    else if (/electric|power|light|wire/i.test(cleanName)) search = "Electricity Department";
    else if (/safety|hazard|danger|collapse/i.test(cleanName)) search = "Public Safety Department";

    record = await Department.findOne({
      departmentName: { $regex: new RegExp(search, "i") },
    });
  }

  if (!record) {
    record = await Department.create({
      departmentName: cleanName === "Other/Unclear" ? "Other Civic Issue" : cleanName,
      description: `${cleanName} Civic Redressal Queue`,
    });
  }

  return record;
}

// ====================== Submit Complaint (with Server AI Validation & Routing) ======================
const submitComplaint = async (req, res) => {
  try {
    const { title, description, category, department, location, priority, image } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required." });
    }

    if (getIsConnected()) {
      // 1. Run real server-side AI validation (authenticity, text classification, image relevance, duplicate check, political/non-civic filter)
      const aiValidation = await validateCivicComplaint(
        { title, description, category, department, location, image },
        Complaint
      );

      // 2. Resolve target department based on AI recommendation or requested department
      const targetDeptName = aiValidation.recommendedDepartment || department || category || "Other/Unclear";
      const departmentRecord = await resolveDepartment(targetDeptName);

      // 3. Find designated authorized officer for this department
      const designatedOfficer = await User.findOne({
        role: "officer",
        department: departmentRecord._id,
      }) || await User.findOne({ role: "officer" });

      // 4. Initial status derived from AI validation workflow rules:
      // Valid -> Accepted and Assigned (or Submitted — Awaiting Validation)
      // Low confidence or Flagged or Possible Duplicate -> Under Manual Review
      // Vague/Missing info -> Needs More Information
      // Political / Non-civic -> Under Manual Review (with clear warning flag)
      let initialStatus = aiValidation.status || "Submitted — Awaiting Validation";
      if (initialStatus === "Accepted and Assigned" && !designatedOfficer) {
        initialStatus = "Submitted — Awaiting Validation";
      }

      const complaintNumber = `GRV${Math.floor(100 + Math.random() * 900)}`;

      const complaint = await Complaint.create({
        complaintNumber,
        title: title.trim(),
        description: description.trim(),
        category: aiValidation.detectedCategory || category || "General",
        department: departmentRecord._id,
        assignedOfficer: designatedOfficer ? designatedOfficer._id : null,
        location: location || "Not specified",
        priority: priority || (aiValidation.priority || "Medium"),
        image: image || "",
        citizen: req.user._id,
        status: initialStatus,
        isClosed: false,
        aiFlag: aiValidation.warnings?.length > 0 ? aiValidation.warnings[0] : "Verified Civic Complaint",
        authenticityScore: aiValidation.authenticityScore || 90,
        aiValidation,
        analysisReasons: aiValidation.warnings || [],
        timeline: [
          {
            title: "Complaint Submitted",
            timestamp: new Date().toISOString(),
            description: `Citizen submitted grievance. Initial AI triage completed.`,
            completed: true,
          },
          {
            title: `AI Classification & Validation (${aiValidation.classificationConfidence}% Confidence)`,
            timestamp: new Date().toISOString(),
            description: `Categorized under "${aiValidation.detectedCategory}". Recommended department: "${departmentRecord.departmentName}". ${aiValidation.explanation}`,
            completed: true,
          },
          ...(initialStatus === "Accepted and Assigned" && designatedOfficer
            ? [
                {
                  title: `Accepted & Assigned to ${designatedOfficer.name}`,
                  timestamp: new Date().toISOString(),
                  description: `Routed to ${departmentRecord.departmentName} queue. Assigned officer: ${designatedOfficer.name} (${designatedOfficer.email}).`,
                  completed: true,
                },
              ]
            : initialStatus === "Needs More Information"
            ? [
                {
                  title: "Action Required: Citizen Details Needed",
                  timestamp: new Date().toISOString(),
                  description: aiValidation.explanation || "Complaint lacks sufficient details to initiate action.",
                  completed: false,
                },
              ]
            : [
                {
                  title: "Queued for Manual Officer Review",
                  timestamp: new Date().toISOString(),
                  description: `Sent to ${departmentRecord.departmentName} manual verification queue. ${aiValidation.explanation}`,
                  completed: false,
                },
              ]),
        ],
      });

      // Notify citizen of submission and current status
      await createNotification({
        userId: req.user._id,
        message: `Your grievance #${complaint.complaintNumber} ("${complaint.title}") was submitted with status "${complaint.status}". Routed to ${departmentRecord.departmentName}.`,
        type: "Complaint",
      });

      // If an officer was assigned, notify officer
      if (designatedOfficer) {
        await createNotification({
          userId: designatedOfficer._id,
          message: `New grievance assigned: #${complaint.complaintNumber} ("${complaint.title}") under ${departmentRecord.departmentName}.`,
          type: "Complaint",
        });
      }

      return res.status(201).json(complaint);
    }

    // In-memory fallback
    const aiValidation = await validateCivicComplaint(
      { title, description, category, department, location, image },
      null
    );

    const newComplaint = {
      _id: "comp_" + Date.now(),
      complaintNumber: `GRV${Math.floor(100 + Math.random() * 900)}`,
      title: title.trim(),
      description: description.trim(),
      category: aiValidation.detectedCategory || category || "General",
      department: { _id: "dept_roads", departmentName: aiValidation.recommendedDepartment || "Roads Department" },
      citizen: { _id: req.user._id, name: req.user.name, email: req.user.email },
      assignedOfficer: null,
      location: location || "Not specified",
      priority: priority || "Medium",
      status: aiValidation.status || "Submitted — Awaiting Validation",
      isClosed: false,
      image: image || "",
      aiFlag: aiValidation.warnings?.length > 0 ? aiValidation.warnings[0] : "Verified Civic Complaint",
      authenticityScore: aiValidation.authenticityScore || 90,
      aiValidation,
      analysisReasons: aiValidation.warnings || [],
      timeline: [
        {
          title: "Complaint Submitted",
          timestamp: new Date().toISOString(),
          description: "Citizen submitted grievance.",
          completed: true,
        },
        {
          title: `AI Classification & Validation (${aiValidation.classificationConfidence}% Confidence)`,
          timestamp: new Date().toISOString(),
          description: `Categorized under "${aiValidation.detectedCategory}". ${aiValidation.explanation}`,
          completed: true,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inMemoryComplaints.unshift(newComplaint);
    return res.status(201).json(newComplaint);
  } catch (error) {
    console.error("Submit Complaint Error:", error);
    res.status(500).json({ message: error.message || "Failed to submit complaint" });
  }
};

// ====================== Get Citizen Complaints (Active vs Closed History) ======================
const getMyComplaints = async (req, res) => {
  try {
    const { history, all } = req.query;

    if (getIsConnected()) {
      let filter = { citizen: req.user._id };

      if (history === "true") {
        // Only closed or resolved archive
        filter.$or = [
          { isClosed: true },
          { status: "Closed" },
        ];
      } else if (all !== "true") {
        // Default: Active complaints only! (Closed complaints excluded from active dashboard)
        filter.isClosed = { $ne: true };
        filter.status = { $ne: "Closed" };
      }

      const complaints = await Complaint.find(filter)
        .populate("department", "departmentName")
        .populate("assignedOfficer", "name email")
        .sort({ createdAt: -1 });

      return res.status(200).json(complaints);
    }

    let myItems = inMemoryComplaints.filter(
      (c) => String(c.citizen?._id || c.citizen) === String(req.user._id)
    );

    if (history === "true") {
      myItems = myItems.filter((c) => c.isClosed === true || c.status === "Closed");
    } else if (all !== "true") {
      myItems = myItems.filter((c) => c.isClosed !== true && c.status !== "Closed");
    }

    res.status(200).json(myItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ====================== Get Complaint By ID ======================
const getComplaintById = async (req, res) => {
  try {
    let complaint = null;
    if (getIsConnected()) {
      complaint = await Complaint.findById(req.params.id)
        .populate("citizen", "name email")
        .populate("department", "departmentName")
        .populate("assignedOfficer", "name email");
    } else {
      complaint = inMemoryComplaints.find((c) => String(c._id) === String(req.params.id));
    }

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Role-based authorization: officers & admins can view assigned / permitted;
    // Citizens can ONLY view their own filed complaints.
    const isOfficer = req.user.role === "officer" || req.user.role === "admin";
    const citizenId = complaint.citizen?._id ? String(complaint.citizen._id) : String(complaint.citizen);
    const requesterId = String(req.user._id);

    if (!isOfficer && citizenId !== requesterId) {
      return res.status(403).json({
        message: "Access denied. Citizens can only view complaints they are authorized to access.",
      });
    }

    return res.status(200).json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ====================== Citizen Confirm Resolution & Satisfaction (Close vs Reopen) ======================
const confirmSatisfaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { satisfied, feedbackRating, feedbackComment, reopenReason } = req.body;

    if (satisfied === undefined || satisfied === null) {
      return res.status(400).json({ message: "Please specify whether you are satisfied with the resolution." });
    }

    const isSatisfied = Boolean(satisfied);

    if (getIsConnected()) {
      const complaint = await Complaint.findById(id);
      if (!complaint) return res.status(404).json({ message: "Complaint not found." });

      if (String(complaint.citizen) !== String(req.user._id)) {
        return res.status(403).json({ message: "Unauthorized: You can only confirm satisfaction for your own complaints." });
      }

      complaint.timeline = complaint.timeline || [];

      if (isSatisfied) {
        // Satisfied -> Mark Closed, archive record, remove from active dashboard
        complaint.status = "Closed";
        complaint.isClosed = true;
        complaint.closedAt = new Date();
        complaint.citizenSatisfaction = {
          confirmed: true,
          satisfied: true,
          feedbackRating: Number(feedbackRating) || 5,
          feedbackComment: (feedbackComment || "").trim(),
          confirmedAt: new Date(),
        };

        if (feedbackRating) {
          complaint.feedback = {
            rating: Number(feedbackRating) || 5,
            comment: (feedbackComment || "").trim(),
            submittedAt: new Date(),
          };
        }

        complaint.timeline.push({
          title: `Citizen Satisfied — Complaint Officially Closed (${Number(feedbackRating) || 5} Stars)`,
          timestamp: new Date().toISOString(),
          description: feedbackComment
            ? `Citizen confirmed resolution satisfaction: "${feedbackComment.trim()}". Grievance has been archived into Closed History.`
            : "Citizen confirmed satisfactory resolution. Grievance closed and archived.",
          completed: true,
        });

        await complaint.save();

        if (complaint.assignedOfficer) {
          await createNotification({
            userId: complaint.assignedOfficer,
            message: `Citizen confirmed satisfaction for grievance #${complaint.complaintNumber}. Status is now CLOSED.`,
            type: "Complaint",
          });
        }

        return res.status(200).json({
          message: "Satisfaction confirmed. Grievance successfully closed and moved to Complaint History.",
          complaint,
        });
      } else {
        // Not satisfied -> Reopen grievance, return to department active queue
        if (!reopenReason && !feedbackComment) {
          return res.status(400).json({ message: "Please provide a reason why you are not satisfied so the officer can address it." });
        }

        const reasonText = (reopenReason || feedbackComment || "").trim();

        complaint.status = "Reopened";
        complaint.isClosed = false;
        complaint.closedAt = null;
        complaint.reopenedAt = new Date();
        complaint.reopenReason = reasonText;
        complaint.citizenSatisfaction = {
          confirmed: true,
          satisfied: false,
          feedbackRating: Number(feedbackRating) || 1,
          feedbackComment: reasonText,
          confirmedAt: new Date(),
        };

        complaint.timeline.push({
          title: "Grievance Reopened by Citizen — Unsatisfied with Resolution",
          timestamp: new Date().toISOString(),
          description: `Citizen noted: "${reasonText}". Complaint returned to active department queue for rectification.`,
          completed: false,
        });

        await complaint.save();

        if (complaint.assignedOfficer) {
          await createNotification({
            userId: complaint.assignedOfficer,
            message: `ACTION REQUIRED: Grievance #${complaint.complaintNumber} was REOPENED by citizen. Reason: ${reasonText}`,
            type: "Complaint",
          });
        }

        return res.status(200).json({
          message: "Grievance reopened and returned to active department queue for further action.",
          complaint,
        });
      }
    }

    // In-memory fallback
    const item = inMemoryComplaints.find((c) => String(c._id) === String(id));
    if (!item) return res.status(404).json({ message: "Complaint not found." });

    if (isSatisfied) {
      item.status = "Closed";
      item.isClosed = true;
      item.closedAt = new Date().toISOString();
      item.citizenSatisfaction = {
        confirmed: true,
        satisfied: true,
        feedbackRating: Number(feedbackRating) || 5,
        feedbackComment: (feedbackComment || "").trim(),
        confirmedAt: new Date().toISOString(),
      };
      item.timeline = item.timeline || [];
      item.timeline.push({
        title: "Citizen Satisfied — Complaint Officially Closed",
        timestamp: new Date().toISOString(),
        description: "Citizen confirmed satisfaction.",
        completed: true,
      });
      return res.status(200).json({ message: "Complaint closed successfully.", complaint: item });
    } else {
      const reasonText = (reopenReason || feedbackComment || "Reopened by citizen").trim();
      item.status = "Reopened";
      item.isClosed = false;
      item.reopenedAt = new Date().toISOString();
      item.reopenReason = reasonText;
      item.timeline = item.timeline || [];
      item.timeline.push({
        title: "Grievance Reopened by Citizen",
        timestamp: new Date().toISOString(),
        description: reasonText,
        completed: false,
      });
      return res.status(200).json({ message: "Complaint reopened successfully.", complaint: item });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ====================== Citizen Provide More Information ======================
const provideMoreInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { additionalDetails, image } = req.body;

    if (!additionalDetails || !additionalDetails.trim()) {
      return res.status(400).json({ message: "Please provide the requested details." });
    }

    if (getIsConnected()) {
      const complaint = await Complaint.findById(id);
      if (!complaint) return res.status(404).json({ message: "Complaint not found." });

      if (String(complaint.citizen) !== String(req.user._id)) {
        return res.status(403).json({ message: "Unauthorized." });
      }

      complaint.description = `${complaint.description}\n\n[Citizen Additional Information]: ${additionalDetails.trim()}`;
      if (image) complaint.image = image;

      // Status moves from Needs More Information to Under Manual Review
      complaint.status = "Under Manual Review";
      complaint.moreInfoRequested = complaint.moreInfoRequested || {};
      complaint.moreInfoRequested.citizenResponse = additionalDetails.trim();
      complaint.moreInfoRequested.respondedAt = new Date();

      complaint.timeline = complaint.timeline || [];
      complaint.timeline.push({
        title: "Additional Information Provided by Citizen",
        timestamp: new Date().toISOString(),
        description: `Citizen details: "${additionalDetails.trim()}". Queued for officer re-verification.`,
        completed: true,
      });

      await complaint.save();

      if (complaint.assignedOfficer) {
        await createNotification({
          userId: complaint.assignedOfficer,
          message: `Citizen provided required details for grievance #${complaint.complaintNumber}. Now awaiting your review.`,
          type: "Complaint",
        });
      }

      return res.status(200).json({ message: "Information submitted successfully. Status updated to Under Manual Review.", complaint });
    }

    const item = inMemoryComplaints.find((c) => String(c._id) === String(id));
    if (item) {
      item.description = `${item.description}\n\n[Citizen Additional Information]: ${additionalDetails.trim()}`;
      item.status = "Under Manual Review";
      item.timeline = item.timeline || [];
      item.timeline.push({
        title: "Additional Information Provided by Citizen",
        timestamp: new Date().toISOString(),
        description: additionalDetails.trim(),
        completed: true,
      });
      return res.status(200).json({ message: "Information submitted.", complaint: item });
    }

    res.status(404).json({ message: "Complaint not found." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ====================== Delete Complaint ======================
const deleteComplaint = async (req, res) => {
  try {
    if (getIsConnected()) {
      const complaint = await Complaint.findById(req.params.id);
      if (complaint) {
        // Enforce rule: Closed complaints must not be deleted!
        if (complaint.isClosed || complaint.status === "Closed") {
          return res.status(400).json({ message: "Closed complaints are preserved in official archive and cannot be deleted." });
        }
        await complaint.deleteOne();
        return res.status(200).json({ message: "Complaint deleted successfully" });
      }
    }

    inMemoryComplaints = inMemoryComplaints.filter((c) => String(c._id) !== String(req.params.id));
    res.status(200).json({ message: "Complaint deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ====================== Submit Citizen Feedback & Star Rating ======================
const submitFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const parsedRating = Number(rating);
    if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5 stars" });
    }

    if (getIsConnected()) {
      const complaint = await Complaint.findById(req.params.id);
      if (!complaint) return res.status(404).json({ message: "Complaint not found" });

      if (String(complaint.citizen) !== String(req.user._id)) {
        return res.status(403).json({ message: "Unauthorized to submit feedback on this complaint" });
      }

      complaint.feedback = {
        rating: parsedRating,
        comment: comment ? comment.trim() : "",
        submittedAt: new Date(),
      };

      complaint.timeline = complaint.timeline || [];
      complaint.timeline.push({
        title: `Citizen Feedback Submitted (${parsedRating} / 5 Stars)`,
        timestamp: new Date().toISOString(),
        description: comment ? `Citizen review: "${comment.trim()}"` : `Rated ${parsedRating} stars by citizen.`,
        completed: true,
      });

      await complaint.save();

      if (complaint.assignedOfficer) {
        await createNotification({
          userId: complaint.assignedOfficer,
          message: `Citizen submitted a ${parsedRating}-star rating for grievance #${complaint.complaintNumber}.`,
          type: "Complaint",
        });
      }

      return res.status(200).json({ message: "Citizen rating submitted successfully", feedback: complaint.feedback });
    }

    const item = inMemoryComplaints.find((c) => String(c._id) === String(req.params.id));
    if (item) {
      item.feedback = {
        rating: parsedRating,
        comment: comment ? comment.trim() : "",
        submittedAt: new Date().toISOString(),
      };
      item.timeline = item.timeline || [];
      item.timeline.push({
        title: `Citizen Feedback Submitted (${parsedRating} / 5 Stars)`,
        timestamp: new Date().toISOString(),
        description: comment ? `Citizen review: "${comment.trim()}"` : `Rated ${parsedRating} stars by citizen.`,
        completed: true,
      });
      return res.status(200).json({ message: "Citizen rating submitted successfully", feedback: item.feedback });
    }

    res.status(404).json({ message: "Complaint not found" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ====================== Re-open Grievance ======================
const reopenComplaint = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: "Please specify the reason for re-opening this grievance" });
    }

    if (getIsConnected()) {
      const complaint = await Complaint.findById(req.params.id);
      if (!complaint) return res.status(404).json({ message: "Complaint not found" });

      if (String(complaint.citizen) !== String(req.user._id)) {
        return res.status(403).json({ message: "Unauthorized to re-open this complaint" });
      }

      complaint.status = "Reopened";
      complaint.isClosed = false;
      complaint.closedAt = null;
      complaint.reopenedAt = new Date();
      complaint.reopenReason = reason.trim();
      complaint.aiFlag = "Re-opened by Citizen: Re-investigation Needed";

      complaint.timeline = complaint.timeline || [];
      complaint.timeline.push({
        title: "Grievance Re-opened by Citizen",
        timestamp: new Date().toISOString(),
        description: `Citizen requested re-examination: "${reason.trim()}". Status reverted to active department queue.`,
        completed: false,
      });

      await complaint.save();

      if (complaint.assignedOfficer) {
        await createNotification({
          userId: complaint.assignedOfficer,
          message: `URGENT: Grievance #${complaint.complaintNumber} has been re-opened by citizen. Reason: ${reason.trim()}`,
          type: "Complaint",
        });
      }

      return res.status(200).json({ message: "Grievance re-opened successfully", complaint });
    }

    const item = inMemoryComplaints.find((c) => String(c._id) === String(req.params.id));
    if (item) {
      item.status = "Reopened";
      item.isClosed = false;
      item.reopenedAt = new Date().toISOString();
      item.reopenReason = reason.trim();
      item.aiFlag = "Re-opened by Citizen: Re-investigation Needed";
      item.timeline = item.timeline || [];
      item.timeline.push({
        title: "Grievance Re-opened by Citizen",
        timestamp: new Date().toISOString(),
        description: `Citizen requested re-examination: "${reason.trim()}"`,
        completed: false,
      });
      return res.status(200).json({ message: "Grievance re-opened successfully", complaint: item });
    }

    res.status(404).json({ message: "Complaint not found" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  submitComplaint,
  getMyComplaints,
  getComplaintById,
  deleteComplaint,
  submitFeedback,
  reopenComplaint,
  confirmSatisfaction,
  provideMoreInfo,
  inMemoryComplaints,
};
