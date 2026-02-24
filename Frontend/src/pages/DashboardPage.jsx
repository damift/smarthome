import React, { useState, useEffect } from "react";
import RoomSidebar from "../components/RoomSidebar";
import HouseLayout from "../components/HouseLayout";
import { roomsService } from "../services/roomsService";
import { devicesService } from "../services/devicesService";

export default function DashboardPage() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const [roomsData, devicesData] = await Promise.all([
          roomsService.getRooms(),
          devicesService.getDevices(),
        ]);

        // Normalize devices and group by room id or room name
        const devicesByRoomId = {};
        const devicesByRoomName = {};

        (devicesData || []).forEach((d) => {
          // normalize type and active status from backend
          const rawType = (d.type || d.device_type || "").toString();
          const typeMap = {
            light: "lightbulb",
            lights: "lightbulb",
            lightbulb: "lightbulb",
            lamp: "lightbulb",
            thermostat: "thermostat",
            thermostat_device: "thermostat",
            camera: "camera",
            cam: "camera",
            lock: "lock",
            doorlock: "lock",
            motion: "motion",
            sensor: "motion",
            unknown: "unknown",
            LIGHT: "lightbulb",
            THERMOSTAT: "thermostat",
            CAMERA: "camera",
            LOCK: "lock",
            MOTION: "motion",
          };

          const mappedType = typeMap[rawType] || typeMap[rawType.toUpperCase?.() ] || "unknown";

          const dev = {
            id: d.id,
            name: d.name || d.display_name || d.type || `Device ${d.id}`,
            type: mappedType,
            active: (typeof d.status === "string" ? d.status.toLowerCase() === "on" : !!d.active),
            icon: d.icon || null,
          };

          // Group by room_id (new system) or room name (fallback)
          if (d.room_id) {
            devicesByRoomId[d.room_id] = devicesByRoomId[d.room_id] || [];
            devicesByRoomId[d.room_id].push(dev);
          } else if (d.room) {
            devicesByRoomName[d.room] = devicesByRoomName[d.room] || [];
            devicesByRoomName[d.room].push(dev);
          }
        });

        const merged = (roomsData || []).map((r) => {
          const roomDevices = devicesByRoomId[r.id] || devicesByRoomName[r.name] || [];
          const deviceCount = roomDevices.length;
          const activeDevices = roomDevices.filter((d) => d.active).length;
          return {
            ...r,
            devices: roomDevices,
            deviceCount,
            activeDevices,
          };
        });

        setRooms(merged);
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

  const handleSelectRoom = (id) => {
    setSelectedRoom((prev) => (prev === id ? null : id));
  };

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

  const displayedRooms = selectedRoom ? rooms.filter((r) => r.id === selectedRoom) : rooms;

  return (
    <div className="flex h-screen bg-zinc-50">
      <RoomSidebar rooms={rooms} selectedRoom={selectedRoom} onSelectRoom={handleSelectRoom} />
      <HouseLayout rooms={displayedRooms} />
    </div>
  );
}
