import api from "../utils/api";

export const complaintService = {
  // Citizen
  submitComplaint: async (payload) => {
    const response = await api.post("/complaints", payload);
    return response.data;
  },

  getMyComplaints: async (params = {}) => {
    const response = await api.get("/complaints/my", { params });
    return response.data;
  },

  getComplaintById: async (id) => {
    const response = await api.get(`/complaints/${id}`);
    return response.data;
  },

  deleteComplaint: async (id) => {
    const response = await api.delete(`/complaints/${id}`);
    return response.data;
  },

  confirmSatisfaction: async (id, payload) => {
    const response = await api.post(`/complaints/${id}/confirm-satisfaction`, payload);
    return response.data;
  },

  provideMoreInfo: async (id, payload) => {
    const response = await api.post(`/complaints/${id}/more-info`, payload);
    return response.data;
  },

  submitFeedback: async (id, { rating, comment }) => {
    const response = await api.post(`/complaints/${id}/feedback`, { rating, comment });
    return response.data;
  },

  reopenComplaint: async (id, { reason }) => {
    const response = await api.post(`/complaints/${id}/reopen`, { reason });
    return response.data;
  },

  // Officer
  getAssignedComplaints: async () => {
    const response = await api.get("/officer/complaints");
    return response.data;
  },

  getOfficerClosedHistory: async () => {
    const response = await api.get("/officer/closed-history");
    return response.data;
  },

  updateComplaintStatus: async (id, payload) => {
    const response = await api.put(`/officer/complaints/${id}`, payload);
    return response.data;
  },

  // Admin / Supervisory
  getAllComplaints: async (params = {}) => {
    const response = await api.get("/admin/complaints", { params });
    return response.data;
  },

  assignOfficer: async ({ complaintId, officerId }) => {
    const response = await api.put("/admin/assign-officer", {
      complaintId,
      officerId,
    });
    return response.data;
  },
};

export default complaintService;
