import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export default function RoomCard({ 
  id, 
  name, 
  deviceCount, 
  activeDevices, 
  devices = [] 
}) {
  const deviceIcons = {
    lightbulb: "💡",
    thermostat: "🌡️",
    lock: "🔒",
    camera: "📷",
    motion: "📡",
  };

  return (
    <div className="border border-zinc-300 rounded-lg p-6 bg-white hover:shadow-lg transition-shadow">
      {/* Header met titel en home icon */}
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold text-zinc-800">{name}</h2>
        <Home className="w-6 h-6 text-zinc-600" />
      </div>

      {/* Device count */}
      <p className="text-sm text-zinc-600 mb-4">{deviceCount} devices</p>

      {/* Status */}
      <div className="mb-4">
        <p className="text-sm text-zinc-600 mb-2">
          Status: <span className="font-semibold">{activeDevices} / {deviceCount} ON</span>
        </p>
      </div>

      {/* Device icons */}
      <div className="flex gap-2 mb-4">
        {devices.map((device, index) => (
          <div
            key={index}
            className={`w-10 h-10 flex items-center justify-center rounded text-lg ${
              device.active
                ? "bg-zinc-800 text-white"
                : "bg-zinc-100 text-zinc-600"
            }`}
            title={device.name}
          >
            {deviceIcons[device.type] || "⚙️"}
          </div>
        ))}
      </div>

      {/* View Details link */}
      <Link
        to={`/rooms/${id}`}
        className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center gap-1 transition-colors"
      >
        View Details
        <span>›</span>
      </Link>
    </div>
  );
}
