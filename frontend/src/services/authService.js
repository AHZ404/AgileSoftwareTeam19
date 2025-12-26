import api from "./api";

export async function login(credentials) {
  return api.request("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
    headers: { "Content-Type": "application/json" },
  });
}

export async function logout() {
  return Promise.resolve();
}

export default { login, logout };
