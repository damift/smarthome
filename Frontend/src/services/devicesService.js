const API_BASE_URL = "http://localhost:8080/api";

export const devicesService = {
  async getDevices() {
    try {
      const response = await fetch(`${API_BASE_URL}/devices`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        console.warn(`devicesService: response not ok ${response.status} ${response.statusText}`);
        return [];
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.warn("devicesService: error fetching devices:", error);
      // Return empty list as a graceful fallback so the UI stays usable
      return [];
    }
  },

  async getDeviceById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/devices/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch device: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching device:", error);
      throw error;
    }
  },

  async createDevice(device) {
    try {
      const response = await fetch(`${API_BASE_URL}/devices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(device),
      });

      if (!response.ok) {
        throw new Error(`Failed to create device: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error creating device:", error);
      throw error;
    }
  },

  async updateDevice(id, device) {
    try {
      const response = await fetch(`${API_BASE_URL}/devices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(device),
      });

      if (!response.ok) {
        throw new Error(`Failed to update device: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating device:", error);
      throw error;
    }
  },

  async deleteDevice(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/devices/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete device: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error deleting device:", error);
      throw error;
    }
  },

  async toggleDevice(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/devices/${id}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Failed to toggle device: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error toggling device:", error);
      throw error;
    }
  },
};
