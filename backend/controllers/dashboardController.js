const Complaint = require("../models/Complaint");
const User = require("../models/User");
const Department = require("../models/Department");
const { getIsConnected } = require("../config/db");
const { inMemoryComplaints } = require("./complaintController");
const { inMemoryUsers } = require("./authController");
const { inMemoryDepartments } = require("./departmentController");

// Citizen Dashboard
const citizenDashboard = async (req, res) => {
  try {
    const citizenId = req.user._id;

    if (getIsConnected()) {
      // Exclude closed complaints from active metrics
      const activeFilter = { citizen: citizenId, isClosed: { $ne: true }, status: { $ne: "Closed" } };

      const totalActiveComplaints = await Complaint.countDocuments(activeFilter);
      const pending = await Complaint.countDocuments({
        ...activeFilter,
        status: { $in: ["Pending", "Submitted — Awaiting Validation", "Needs More Information", "Under Manual Review"] },
      });
      const assigned = await Complaint.countDocuments({
        ...activeFilter,
        status: { $in: ["Assigned", "Accepted and Assigned", "In Progress", "Reopened"] },
      });
      const resolvedAwaitingConfirm = await Complaint.countDocuments({
        ...activeFilter,
        status: { $in: ["Resolved", "RESOLVED_AWAITING_FEEDBACK"] },
      });
      const closedCount = await Complaint.countDocuments({
        citizen: citizenId,
        $or: [{ isClosed: true }, { status: "Closed" }],
      });
      const rejectedCount = await Complaint.countDocuments({
        citizen: citizenId,
        status: "Rejected",
      });

      return res.json({
        totalComplaints: totalActiveComplaints,
        pending,
        assigned,
        resolved: resolvedAwaitingConfirm,
        closed: closedCount,
        rejected: rejectedCount,
      });
    }

    // Dynamic calculation from session complaints
    const myComplaints = inMemoryComplaints.filter(
      (c) => String(c.citizen?._id || c.citizen) === String(citizenId)
    );
    const active = myComplaints.filter((c) => !c.isClosed && c.status !== "Closed");

    res.json({
      totalComplaints: active.length,
      pending: active.filter((c) => ["Pending", "Submitted — Awaiting Validation", "Needs More Information", "Under Manual Review"].includes(c.status)).length,
      assigned: active.filter((c) => ["Assigned", "Accepted and Assigned", "In Progress", "Reopened"].includes(c.status)).length,
      resolved: active.filter((c) => ["Resolved", "RESOLVED_AWAITING_FEEDBACK"].includes(c.status)).length,
      closed: myComplaints.filter((c) => c.isClosed || c.status === "Closed").length,
      rejected: myComplaints.filter((c) => c.status === "Rejected").length,
    });
  } catch (error) {
    res.json({
      totalComplaints: 0,
      pending: 0,
      assigned: 0,
      resolved: 0,
      closed: 0,
      rejected: 0,
    });
  }
};

// Officer Dashboard
const officerDashboard = async (req, res) => {
  try {
    const officerId = req.user._id;

    if (getIsConnected()) {
      const officer = await User.findById(officerId);
      const isSupervisorOrAdmin = req.user.role === "admin";

      let query = {
        isClosed: { $ne: true },
        status: { $ne: "Closed" },
      };

      if (!isSupervisorOrAdmin) {
        const conditions = [{ assignedOfficer: officerId }];
        if (officer?.department) {
          conditions.push({ department: officer.department });
        }
        query.$and = [{ $or: conditions }];
      }

      const totalActiveAssigned = await Complaint.countDocuments(query);
      const pending = await Complaint.countDocuments({
        ...query,
        status: { $in: ["Pending", "Submitted — Awaiting Validation", "Needs More Information", "Under Manual Review"] },
      });
      const inProgress = await Complaint.countDocuments({
        ...query,
        status: { $in: ["Assigned", "Accepted and Assigned", "In Progress", "Reopened"] },
      });
      const resolved = await Complaint.countDocuments({
        ...query,
        status: { $in: ["Resolved", "RESOLVED_AWAITING_FEEDBACK"] },
      });

      // Closed history count for this department/officer
      let closedQuery = {
        $or: [{ isClosed: true }, { status: "Closed" }],
      };
      if (!isSupervisorOrAdmin) {
        const conditions = [{ assignedOfficer: officerId }];
        if (officer?.department) conditions.push({ department: officer.department });
        closedQuery.$and = [{ $or: conditions }];
      }
      const closed = await Complaint.countDocuments(closedQuery);

      return res.json({
        assigned: totalActiveAssigned,
        totalComplaints: totalActiveAssigned,
        pending,
        inProgress,
        resolved,
        closed,
      });
    }

    // In-memory
    const officer = inMemoryUsers.find((u) => String(u._id) === String(officerId));
    const assignedComplaints = inMemoryComplaints.filter((c) => {
      if (c.isClosed || c.status === "Closed") return false;
      return (
        !c.assignedOfficer ||
        String(c.assignedOfficer?._id || c.assignedOfficer) === String(officerId) ||
        (officer?.department && String(c.department?._id || c.department) === String(officer.department))
      );
    });

    const resolved = assignedComplaints.filter((c) => ["Resolved", "RESOLVED_AWAITING_FEEDBACK"].includes(c.status)).length;
    const inProgress = assignedComplaints.filter((c) => ["In Progress", "Accepted and Assigned", "Reopened"].includes(c.status)).length;
    const pending = assignedComplaints.filter((c) => ["Pending", "Submitted — Awaiting Validation", "Under Manual Review", "Needs More Information"].includes(c.status)).length;

    res.json({
      assigned: assignedComplaints.length,
      totalComplaints: assignedComplaints.length,
      pending,
      inProgress,
      resolved,
      closed: inMemoryComplaints.filter((c) => c.isClosed || c.status === "Closed").length,
    });
  } catch (error) {
    res.json({
      assigned: 0,
      totalComplaints: 0,
      pending: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0,
    });
  }
};

// Admin Dashboard
const adminDashboard = async (req, res) => {
  try {
    if (getIsConnected()) {
      const totalUsers = await User.countDocuments();
      // Total active complaints excluding closed
      const totalComplaints = await Complaint.countDocuments({
        isClosed: { $ne: true },
        status: { $ne: "Closed" },
      });
      const closedComplaints = await Complaint.countDocuments({
        $or: [{ isClosed: true }, { status: "Closed" }],
      });
      const departments = await Department.countDocuments();
      const resolved = await Complaint.countDocuments({
        status: { $in: ["Resolved", "RESOLVED_AWAITING_FEEDBACK"] },
        isClosed: { $ne: true },
      });
      const pending = await Complaint.countDocuments({
        status: { $in: ["Pending", "Submitted — Awaiting Validation", "Needs More Information", "Under Manual Review"] },
        isClosed: { $ne: true },
      });
      const officers = await User.countDocuments({ role: "officer" });

      return res.json({
        totalUsers,
        totalComplaints,
        closedComplaints,
        departments,
        resolved,
        pending,
        officers,
      });
    }

    const active = inMemoryComplaints.filter((c) => !c.isClosed && c.status !== "Closed");

    res.json({
      totalUsers: inMemoryUsers.length,
      totalComplaints: active.length,
      closedComplaints: inMemoryComplaints.filter((c) => c.isClosed || c.status === "Closed").length,
      departments: (inMemoryDepartments || []).length,
      resolved: active.filter((c) => ["Resolved", "RESOLVED_AWAITING_FEEDBACK"].includes(c.status)).length,
      pending: active.filter((c) => ["Pending", "Submitted — Awaiting Validation", "Under Manual Review"].includes(c.status)).length,
      officers: inMemoryUsers.filter((u) => u.role === "officer").length,
    });
  } catch (error) {
    res.json({
      totalUsers: 0,
      totalComplaints: 0,
      closedComplaints: 0,
      departments: 0,
      resolved: 0,
      pending: 0,
      officers: 0,
    });
  }
};

module.exports = {
  citizenDashboard,
  officerDashboard,
  adminDashboard,
};
