import api from "../utils/api";

export const announcementService = {
  getAnnouncements: async () => {
    const response = await api.get("/announcements");
    return response.data;
  },

  createAnnouncement: async (payload) => {
    const response = await api.post("/announcements", payload);
    return response.data;
  },

  updateAnnouncement: async (id, payload) => {
    const response = await api.put(`/announcements/${id}`, payload);
    return response.data;
  },

  deleteAnnouncement: async (id) => {
    const response = await api.delete(`/announcements/${id}`);
    return response.data;
  },
};

export default announcementService;
