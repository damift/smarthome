const API_BASE_URL = "http://localhost:8080/api";

export const roomsService = {
  async getRooms() {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch rooms: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching rooms:", error);
      throw error;
    }
  },

  async getRoomById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch room: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching room:", error);
      throw error;
    }
  },
};
