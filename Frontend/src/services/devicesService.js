const API_BASE_URL = "http://localhost:8080/api";

export const devicesService = {
  async getDevices() {
    try {
      const response = await fetch(`${API_BASE_URL}/devices`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch devices: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching devices:", error);
      throw error;
    }
  },
};
