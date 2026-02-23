import React, { useState } from "react";
import RoomSidebar from "../components/RoomSidebar";
import HouseLayout from "../components/HouseLayout";

// Mock data - Later vervangen met API calls
const mockRooms = [
  {
    id: 1,
    name: "Living Room",
    deviceCount: 4,
    activeDevices: 3,
    devices: [
      { name: "Light 1", type: "lightbulb", active: true },
      { name: "Light 2", type: "lightbulb", active: true },
      { name: "Thermostat", type: "thermostat", active: false },
      { name: "Camera", type: "camera", active: true },
    ],
  },
  {
    id: 2,
    name: "Bedroom",
    deviceCount: 3,
    activeDevices: 1,
    devices: [
      { name: "Light", type: "lightbulb", active: false },
      { name: "Thermostat", type: "thermostat", active: true },
      { name: "Door Lock", type: "lock", active: false },
    ],
  },
  {
    id: 3,
    name: "Kitchen",
    deviceCount: 3,
    activeDevices: 3,
    devices: [
      { name: "Light 1", type: "lightbulb", active: true },
      { name: "Light 2", type: "lightbulb", active: true },
      { name: "Motion Sensor", type: "motion", active: true },
    ],
  },
  {
    id: 4,
    name: "Bathroom",
    deviceCount: 2,
    activeDevices: 1,
    devices: [
      { name: "Light", type: "lightbulb", active: false },
      { name: "Motion Sensor", type: "motion", active: true },
    ],
  },
  {
    id: 5,
    name: "Garage",
    deviceCount: 3,
    activeDevices: 1,
    devices: [
      { name: "Light", type: "lightbulb", active: false },
      { name: "Door Lock", type: "lock", active: true },
      { name: "Camera", type: "camera", active: false },
    ],
  },
];

export default function DashboardPage() {
  const [selectedRoom, setSelectedRoom] = useState(null);

  return (
    <div className="flex h-screen bg-zinc-50">
      <RoomSidebar rooms={mockRooms} selectedRoom={selectedRoom} />
      <HouseLayout rooms={mockRooms} />
    </div>
  );
}
