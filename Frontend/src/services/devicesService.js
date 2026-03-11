import { getToken } from "@/lib/auth";

const API_BASE_URL = "http://localhost:8080/api";

export const devicesService = {
  // De dashboard-flow moet altijd blijven renderen; daarom geven we bij fouten een lege lijst terug.
  async getDevices() {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/devices`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        console.warn(
          `devicesService: response not ok ${response.status} ${response.statusText}`,
        );
        // Soft-fail: hiermee voorkomen we dat 1 endpoint-fout de hele pagina breekt.
        return [];
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.warn("devicesService: error fetching devices:", error);
      // Extra vangnet voor netwerkfouten tijdens initial load.
      return [];
    }
  },

  // Detailpagina's verwachten harde fouten, daarom gooien we hier wel een error.
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

      const data = await response.json();

      if (!response.ok) {
        // Validatiefouten geven we door als platte tekst zodat forms ze direct kunnen tonen.
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join(", ");
          throw new Error(errorMessages);
        }
        throw new Error(
          data.message || `Failed to create device: ${response.statusText}`,
        );
      }

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

      const data = await response.json();

      if (!response.ok) {
        // Zelfde foutafhandeling als create voor consistente UX in beheerformulieren.
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join(", ");
          throw new Error(errorMessages);
        }
        throw new Error(
          data.message || `Failed to update device: ${response.statusText}`,
        );
      }

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

  async executeDeviceAction(id, actionId, value) {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/devices/${id}/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action_id: actionId,
          value,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        // Sommige endpoints sturen `error`, andere `message`; we ondersteunen beide vormen.
        throw new Error(
          data.error ||
            data.message ||
            `Failed to execute action: ${response.statusText}`,
        );
      }

      return data;
    } catch (error) {
      console.error("Error executing device action:", error);
      throw error;
    }
  },

  // Legacy fallback voor oude flows; nieuwe UI gebruikt `executeDeviceAction`.
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
