import api from "../utils/api";

export const authService = {
  login: async ({ email, password, role }) => {
    const payload = { email, password };
    if (role) payload.role = role;
    const response = await api.post("/auth/login", payload);
    const user = response.data;
    localStorage.setItem("currentUser", JSON.stringify(user));
    return user;
  },

  register: async ({ name, email, password, phone, address, role = "client", department }) => {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
      phone,
      address,
      role,
      department,
    });
    const user = response.data;
    localStorage.setItem("currentUser", JSON.stringify(user));
    return user;
  },

  getProfile: async () => {
    const response = await api.get("/auth/profile");
    return response.data;
  },

  updateProfile: async ({ name, phone, address }) => {
    const response = await api.put("/auth/profile", { name, phone, address });
    const user = response.data;
    if (user?.token) {
      const prev = JSON.parse(localStorage.getItem("currentUser") || "{}");
      const merged = { ...prev, ...user };
      localStorage.setItem("currentUser", JSON.stringify(merged));
    }
    return user;
  },

  changePassword: async ({ currentPassword, newPassword }) => {
    const response = await api.put("/auth/change-password", { currentPassword, newPassword });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("currentUser");
  },
};

export default authService;
