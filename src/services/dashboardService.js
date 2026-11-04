import api from "../utils/api";

export const dashboardService = {
  getCitizenDashboard: async () => {
    const response = await api.get("/dashboard/citizen");
    return response.data;
  },

  getOfficerDashboard: async () => {
    const response = await api.get("/dashboard/officer");
    return response.data;
  },

  getAdminDashboard: async () => {
    const response = await api.get("/dashboard/admin");
    return response.data;
  },
};

export default dashboardService;
