import React, { useState, useEffect } from "react";
import RoomSidebar from "../components/RoomSidebar";
import HouseLayout from "../components/HouseLayout";
import { roomsService } from "../services/roomsService";

export default function DashboardPage() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const data = await roomsService.getRooms();
        setRooms(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch rooms:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-50">
        <p className="text-zinc-600">Loading rooms...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-50">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading rooms</p>
          <p className="text-zinc-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-50">
      <RoomSidebar rooms={rooms} selectedRoom={selectedRoom} />
      <HouseLayout rooms={rooms} />
    </div>
  );
}
