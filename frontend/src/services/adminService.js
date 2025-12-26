import api from "./api";

export const getAdminStats = async () => api.request("/admin/stats");

export default { getAdminStats };
