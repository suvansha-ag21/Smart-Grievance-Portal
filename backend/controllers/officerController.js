const Complaint = require("../models/Complaint");
const User = require("../models/User");
const Department = require("../models/Department");
const { getIsConnected } = require("../config/db");
const { inMemoryComplaints } = require("./complaintController");
const { createNotification } = require("./notificationController");

// Helper to resolve Department model ID for a department name or keyword
async function resolveDepartment(deptName) {
  if (!deptName) deptName = "Other/Unclear";

  const cleanName = deptName.trim();
  let record = await Department.findOne({
    departmentName: { $regex: new RegExp(`^${cleanName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i") },
  });

  if (!record) {
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

// ====================== Get Active Department & Assigned Complaints ======================
const getAssignedComplaints = async (req, res) => {
  try {
    const isSupervisorOrAdmin = req.user.role === "admin";

    if (getIsConnected()) {
      const officer = await User.findById(req.user._id);

      // Base query: Active only (Exclude closed complaints)
      let query = {
        isClosed: { $ne: true },
        status: { $ne: "Closed" },
      };

      // Role & Department-based access control:
      // Supervisors/Admins see all departments.
      // Officers ONLY see complaints routed to their department or assigned to them.
      if (!isSupervisorOrAdmin) {
        const conditions = [{ assignedOfficer: req.user._id }];
        if (officer?.department) {
          conditions.push({ department: officer.department });
        }
        query.$and = [{ $or: conditions }];
      }

      const complaints = await Complaint.find(query)
        .populate("citizen", "name email")
        .populate("department", "departmentName")
        .populate("assignedOfficer", "name email")
        .sort({ createdAt: -1 });

      return res.status(200).json(complaints);
    }

    // In-memory fallback
    const officerId = String(req.user._id);
    const assigned = inMemoryComplaints.filter((c) => {
      if (c.isClosed || c.status === "Closed") return false;
      if (isSupervisorOrAdmin) return true;
      return (
        String(c.assignedOfficer?._id || c.assignedOfficer) === officerId ||
        !c.assignedOfficer
      );
    });

    res.status(200).json(assigned);
  } catch (error) {
    console.error("Get Assigned Complaints Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ====================== Get Closed History / Resolved Archive ======================
const getClosedHistory = async (req, res) => {
  try {
    const isSupervisorOrAdmin = req.user.role === "admin";

    if (getIsConnected()) {
      const officer = await User.findById(req.user._id);

      // Closed complaints query
      let query = {
        $or: [{ isClosed: true }, { status: "Closed" }],
      };

      if (!isSupervisorOrAdmin) {
        const conditions = [{ assignedOfficer: req.user._id }];
        if (officer?.department) {
          conditions.push({ department: officer.department });
        }
        query.$and = [{ $or: conditions }];
      }

      const closedComplaints = await Complaint.find(query)
        .populate("citizen", "name email")
        .populate("department", "departmentName")
        .populate("assignedOfficer", "name email")
        .sort({ closedAt: -1, updatedAt: -1 });

      return res.status(200).json(closedComplaints);
    }

    const closed = inMemoryComplaints.filter((c) => c.isClosed || c.status === "Closed");
    res.status(200).json(closed);
  } catch (error) {
    console.error("Get Closed History Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ====================== Update Complaint Status & Officer AI Review Actions ======================
const updateComplaintStatus = async (req, res) => {
  try {
    const {
      status,
      remarks,
      resolutionImage,
      aiAction,          // 'confirm' | 'correct_category' | 'request_info' | 'mark_duplicate' | 'reject' | 'resolve'
      correctedCategory,
      correctedDepartment,
      rejectionReason,
      infoRequestReason,
      duplicateNote,
    } = req.body;

    if (getIsConnected()) {
      const complaint = await Complaint.findById(req.params.id)
        .populate("department", "departmentName")
        .populate("assignedOfficer", "name email");

      if (!complaint) {
        return res.status(404).json({ message: "Complaint not found" });
      }

      complaint.timeline = complaint.timeline || [];

      // 1. Handle Officer AI Review Center Actions
      if (aiAction === "confirm") {
        // Confirm complaint authenticity & routing
        complaint.status = "Accepted and Assigned";
        complaint.aiFlag = "Verified & Confirmed by Officer";
        complaint.assignedOfficer = req.user._id;
        if (complaint.aiValidation) {
          complaint.aiValidation.recommendedAction = "Confirmed by Officer";
        }
        complaint.timeline.push({
          title: "Officer Confirmed & Assigned",
          timestamp: new Date().toISOString(),
          description: remarks || `Officer verified AI validation and accepted complaint for field resolution.`,
          completed: true,
        });
      } else if (aiAction === "correct_category") {
        // Correct Category and Re-route Department
        const newCat = (correctedCategory || complaint.category || "General").trim();
        const newDeptName = (correctedDepartment || newCat).trim();
        const newDept = await resolveDepartment(newDeptName);

        complaint.category = newCat;
        complaint.department = newDept._id;
        complaint.status = "Accepted and Assigned";
        complaint.aiFlag = `Re-routed to ${newDept.departmentName}`;

        // Find available officer in that department
        const targetOfficer = await User.findOne({ role: "officer", department: newDept._id });
        if (targetOfficer) {
          complaint.assignedOfficer = targetOfficer._id;
        }

        complaint.timeline.push({
          title: `Category Corrected & Re-routed to ${newDept.departmentName}`,
          timestamp: new Date().toISOString(),
          description: remarks || `Officer reclassified category to "${newCat}" and routed complaint to ${newDept.departmentName}.`,
          completed: true,
        });
      } else if (aiAction === "request_info") {
        // Request More Information from citizen
        const reqReason = (infoRequestReason || remarks || "Please provide clearer photographic evidence or more exact location.").trim();
        complaint.status = "Needs More Information";
        complaint.aiFlag = "Needs More Information from Citizen";
        complaint.moreInfoRequested = {
          requested: true,
          requestedAt: new Date(),
          reason: reqReason,
          citizenResponse: "",
          respondedAt: null,
        };
        complaint.timeline.push({
          title: "Officer Requested More Information",
          timestamp: new Date().toISOString(),
          description: reqReason,
          completed: false,
        });
      } else if (aiAction === "mark_duplicate") {
        // Mark Possible Duplicate
        const dupNote = (duplicateNote || remarks || "Officer flagged grievance as a possible duplicate complaint for joint review.").trim();
        complaint.status = "Under Manual Review";
        complaint.aiFlag = "Flagged: Potential Duplicate Under Investigation";
        if (complaint.aiValidation) {
          complaint.aiValidation.isPossibleDuplicate = true;
          complaint.aiValidation.warnings = [...(complaint.aiValidation.warnings || []), dupNote];
        }
        complaint.timeline.push({
          title: "Flagged as Possible Duplicate",
          timestamp: new Date().toISOString(),
          description: dupNote,
          completed: false,
        });
      } else if (aiAction === "reject") {
        // Reject with clear reason
        const reason = (rejectionReason || remarks || "Complaint does not meet actionable civic criteria.").trim();
        complaint.status = "Rejected";
        complaint.rejectionReason = reason;
        complaint.aiFlag = `Rejected: ${reason}`;
        complaint.timeline.push({
          title: "Complaint Rejected with Reason",
          timestamp: new Date().toISOString(),
          description: reason,
          completed: true,
        });
      } else if (status === "Resolved" || aiAction === "resolve") {
        // Resolve Complaint -> prompt citizen satisfaction
        complaint.status = "Resolved";
        complaint.resolutionDetails = {
          remarks: (remarks || "Grievance resolved by department personnel.").trim(),
          resolutionImage: resolutionImage || "",
          resolvedAt: new Date(),
          resolvedBy: req.user._id,
        };
        if (resolutionImage) complaint.resolutionImage = resolutionImage;
        if (remarks) complaint.remarks = remarks;

        complaint.timeline.push({
          title: "Work Completed — Awaiting Citizen Confirmation",
          timestamp: new Date().toISOString(),
          description: remarks || "Officer marked work completed and submitted resolution proof. Awaiting citizen satisfaction sign-off.",
          completed: true,
        });
      } else if (status) {
        // Standard status change (e.g. In Progress)
        complaint.status = status;
        if (remarks !== undefined) complaint.remarks = remarks;
        if (resolutionImage) complaint.resolutionImage = resolutionImage;

        if (!complaint.assignedOfficer) {
          complaint.assignedOfficer = req.user._id;
        }

        complaint.timeline.push({
          title: `Status Updated to "${status}"`,
          timestamp: new Date().toISOString(),
          description: remarks || `Officer status update: ${status}`,
          completed: status === "Resolved",
        });
      }

      await complaint.save();

      // Notify citizen of the update
      if (complaint.citizen) {
        const citizenId = complaint.citizen._id || complaint.citizen;
        let notifMsg = `Update on grievance #${complaint.complaintNumber}: Status is now "${complaint.status}".`;
        if (complaint.status === "Resolved") {
          notifMsg = `Grievance #${complaint.complaintNumber} has been marked Resolved. Please confirm your satisfaction to close or reopen.`;
        } else if (complaint.status === "Needs More Information") {
          notifMsg = `ACTION NEEDED: Officer requested more details for grievance #${complaint.complaintNumber}. Reason: ${complaint.moreInfoRequested?.reason}`;
        } else if (complaint.status === "Rejected") {
          notifMsg = `Grievance #${complaint.complaintNumber} was rejected. Reason: ${complaint.rejectionReason}`;
        }

        await createNotification({
          userId: citizenId,
          message: notifMsg,
          type: "Complaint",
        });
      }

      return res.status(200).json({
        message: "Complaint updated successfully",
        complaint,
      });
    }

    // In-memory fallback
    const item = inMemoryComplaints.find((c) => String(c._id) === String(req.params.id));
    if (item) {
      if (status) item.status = status;
      if (remarks) item.remarks = remarks;
      if (resolutionImage) item.resolutionImage = resolutionImage;
      if (aiAction === "confirm") {
        item.status = "Accepted and Assigned";
        item.aiFlag = "Verified & Confirmed by Officer";
      } else if (aiAction === "reject") {
        item.status = "Rejected";
        item.rejectionReason = rejectionReason || remarks || "Rejected by officer";
      } else if (status === "Resolved" || aiAction === "resolve") {
        item.status = "Resolved";
      }
      return res.status(200).json({ message: "Complaint updated successfully", complaint: item });
    }

    res.status(404).json({ message: "Complaint not found" });
  } catch (error) {
    console.error("Update Complaint Status Error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAssignedComplaints,
  getClosedHistory,
  updateComplaintStatus,
};
