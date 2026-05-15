// src/services/usuariosApi.js
const BASE_URL = import.meta.env.VITE_API_URL;

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: getAuthHeaders(),
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Error desconocido" }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const usuariosApi = {
  obtenerTodos:   ()             => request(""),
  obtenerPorId:   (id)           => request(`/${id}`),
  obtenerPorEmail:(email)        => request(`/email/${email}`),
  registrar:      (usuario)      => request("/registro", { method: "POST", body: JSON.stringify(usuario) }),
  login:          (email, pass)  => request("/login",    { method: "POST", body: JSON.stringify({ email, password: pass }) }),
  actualizar:     (id, usuario)  => request(`/${id}`,    { method: "PUT",  body: JSON.stringify(usuario) }),
  eliminar:       (id)           => request(`/${id}`,    { method: "DELETE" }),
  healthCheck:    ()             => request("/health"),
};
