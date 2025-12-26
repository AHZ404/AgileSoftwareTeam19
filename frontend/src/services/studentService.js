import api from "./api";

export const getMyCourses = async () => api.request("/student/courses");

export default { getMyCourses };
