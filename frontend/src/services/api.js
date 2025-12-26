const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json().catch(() => null);
}

export default { request };
