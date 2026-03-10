import React, { useState, useEffect } from "react";
import RoomSidebar from "../components/RoomSidebar";
import HouseLayout from "../components/HouseLayout";
import { roomsService } from "../services/roomsService";
import { devicesService } from "../services/devicesService";
import LoadingState from "@/components/ui/LoadingState";

export default function DashboardPage() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Laadt kamers + devices tegelijk en bouwt een room-centric viewmodel voor de UI.
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const [roomsData, devicesData] = await Promise.all([
          roomsService.getRooms(),
          devicesService.getDevices(),
        ]);

        const roomList = Array.isArray(roomsData) ? roomsData : roomsData?.data || [];
        const deviceList = Array.isArray(devicesData) ? devicesData : devicesData?.data || [];

        // Normaliseert verschillende status-formaten naar 1 active boolean.
        const normalizeDevice = (device) => {
          const status = typeof device.status === "string" ? device.status.toUpperCase() : null;
          const activeFromStatus = status ? status === "ON" : null;
          const activeFromState =
            typeof device.state === "object" && device.state !== null
              ? Boolean(device.state.TURN_ON)
              : null;

          return {
            ...device,
            active:
              typeof device.active === "boolean"
                ? device.active
                : activeFromStatus !== null
                ? activeFromStatus
                : activeFromState !== null
                ? activeFromState
                : false,
          };
        };

        // Group devices by both id and name fallback.
        const devicesByRoomId = {};
        const devicesByRoomName = {};

        deviceList.map(normalizeDevice).forEach((device) => {
          const roomId = device.room_id ?? device.room?.id ?? null;
          const roomName = device.room?.name ?? device.room_name ?? null;

          if (roomId !== null && roomId !== undefined) {
            const key = String(roomId);
            devicesByRoomId[key] = devicesByRoomId[key] || [];
            devicesByRoomId[key].push(device);
          }

          if (roomName) {
            const key = String(roomName).toLowerCase();
            devicesByRoomName[key] = devicesByRoomName[key] || [];
            devicesByRoomName[key].push(device);
          }
        });

       
        // Verrijkt elke room met devices, totalen en actieve counts.
        const merged = roomList.map((r) => {
          const roomIdKey = String(r.id);
          const roomNameKey = String(r.name || "").toLowerCase();
          const roomDevices = devicesByRoomId[roomIdKey] || devicesByRoomName[roomNameKey] || [];
          const deviceCount = roomDevices.length;
          const activeDevices = roomDevices.filter((d) => d.active).length;
          return {
            ...r,
            devices: roomDevices,
            deviceCount,
            activeDevices,
          };
        }).filter((room) => room.deviceCount > 0);

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
    return <LoadingState variant="page" fullScreen message="Loading rooms..." />;
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

  // Filtert op zijbalk-selectie; null betekent "All Rooms".
  const displayedRooms = selectedRoom ? rooms.filter((r) => r.id === selectedRoom) : rooms;

  return (
    <div className="flex h-screen bg-zinc-50">
      <RoomSidebar rooms={rooms} selectedRoom={selectedRoom} onSelectRoom={handleSelectRoom} />
      <HouseLayout rooms={displayedRooms} />
    </div>
  );
}
