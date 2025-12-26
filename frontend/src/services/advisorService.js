import api from "./api";

export const getAdvisorOverview = async () => api.request("/advisor/overview");

export default { getAdvisorOverview };
