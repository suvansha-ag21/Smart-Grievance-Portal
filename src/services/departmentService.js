import api from "../utils/api";

export const departmentService = {
  getDepartments: async () => {
    const response = await api.get("/departments");
    return response.data;
  },

  createDepartment: async (payload) => {
    const response = await api.post("/departments", payload);
    return response.data;
  },

  updateDepartment: async (id, payload) => {
    const response = await api.put(`/departments/${id}`, payload);
    return response.data;
  },

  deleteDepartment: async (id) => {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  },
};

export default departmentService;
