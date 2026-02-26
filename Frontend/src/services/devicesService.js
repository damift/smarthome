import { getToken } from "@/lib/auth";

const API_BASE_URL = "http://localhost:8080/api";

function authHeaders(json = false) {
  const token = getToken();
  const headers = {};

  if (token) headers.Authorization = `Bearer ${token}`;
  if (json) headers["Content-Type"] = "application/json";
  headers.Accept = "application/json";

  return headers;
}

async function readJsonSafe(res) {
  const text = await res.text().catch(() => "");
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function ensureArray(data) {
  // ondersteunt: [], {data: []}, {devices: []}, single object
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.devices)) return data.devices;
  if (data && typeof data === "object") return [data];
  return [];
}

export const devicesService = {
  async getDevices() {
    const response = await fetch(`${API_BASE_URL}/devices`, {
      method: "GET",
      headers: authHeaders(false),
    });

    const data = await readJsonSafe(response);

    if (!response.ok) {
      const msg =
        data?.message ||
        data?.error ||
        `${response.status} ${response.statusText}`;
      // Niet meer doen alsof het “gewoon leeg” is.
      throw new Error(msg);
    }

    return ensureArray(data);
  },

  async getDeviceById(id) {
    const response = await fetch(`${API_BASE_URL}/devices/${id}`, {
      method: "GET",
      headers: authHeaders(false),
    });

    const data = await readJsonSafe(response);

    if (!response.ok) {
      const msg =
        data?.message ||
        data?.error ||
        `Failed to fetch device: ${response.status} ${response.statusText}`;
      throw new Error(msg);
    }

    return data;
  },

  async createDevice(device) {
    const response = await fetch(`${API_BASE_URL}/devices`, {
      method: "POST",
      headers: authHeaders(true),
      body: JSON.stringify(device),
    });

    const data = await readJsonSafe(response);

    if (!response.ok) {
      if (data?.errors) {
        const errorMessages = Object.values(data.errors).flat().join(", ");
        throw new Error(errorMessages);
      }
      throw new Error(data?.message || `Failed to create device: ${response.status} ${response.statusText}`);
    }

    return data;
  },

  async updateDevice(id, device) {
    const response = await fetch(`${API_BASE_URL}/devices/${id}`, {
      method: "PUT",
      headers: authHeaders(true),
      body: JSON.stringify(device),
    });

    const data = await readJsonSafe(response);

    if (!response.ok) {
      if (data?.errors) {
        const errorMessages = Object.values(data.errors).flat().join(", ");
        throw new Error(errorMessages);
      }
      throw new Error(data?.message || `Failed to update device: ${response.status} ${response.statusText}`);
    }

    return data;
  },

  async deleteDevice(id) {
    const response = await fetch(`${API_BASE_URL}/devices/${id}`, {
      method: "DELETE",
      headers: authHeaders(false),
    });

    const data = await readJsonSafe(response);

    if (!response.ok) {
      throw new Error(data?.message || `Failed to delete device: ${response.status} ${response.statusText}`);
    }

    return data;
  },

  async toggleDevice(id) {
    const response = await fetch(`${API_BASE_URL}/devices/${id}/toggle`, {
      method: "POST",
      headers: authHeaders(false),
    });

    const data = await readJsonSafe(response);

    if (!response.ok) {
      throw new Error(data?.message || `Failed to toggle device: ${response.status} ${response.statusText}`);
    }

    return data;
  },
};