import api from "../utils/api";

export const adminService = {
  getUsers: async () => {
    const response = await api.get("/admin/users");
    return response.data;
  },

  createOfficer: async (payload) => {
    const response = await api.post("/admin/officers", payload);
    return response.data;
  },
};

export default adminService;
