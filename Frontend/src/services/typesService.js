const API_BASE_URL = "http://localhost:8080/api";

export const typesService = {
  // Type-lijst voor formulieren en device-mapping.
  async getTypes() {
    try {
      const response = await fetch(`${API_BASE_URL}/types`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch types: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching types:", error);
      return [];
    }
  },

  // Basis CRUD voor device types.
  async getType(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/types/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch type: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error getting type:", error);
      throw error;
    }
  },

  async createType(name) {
    try {
      const response = await fetch(`${API_BASE_URL}/types`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Failed to create type: ${response.statusText}`);
      }
      return data;
    } catch (error) {
      console.error("Error creating type:", error);
      throw error;
    }
  },

  async updateType(id, name) {
    try {
      const response = await fetch(`${API_BASE_URL}/types/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Failed to update type: ${response.statusText}`);
      }
      return data;
    } catch (error) {
      console.error("Error updating type:", error);
      throw error;
    }
  },

  async deleteType(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/types/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || `Failed to delete type: ${response.statusText}`);
      }
      return true;
    } catch (error) {
      console.error("Error deleting type:", error);
      throw error;
    }
  },
};

export default typesService;
