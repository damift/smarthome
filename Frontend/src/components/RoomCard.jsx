import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export default function RoomCard({ 
  name, 
  deviceCount, 
  activeDevices, 
  devices = [] 
}) {
  // Fallback iconset voor devices zonder expliciet icon uit de API.
  const deviceIcons = {
    lightbulb: "💡",
    thermostat: "🌡️",
    lock: "🔒",
    camera: "📷",
    motion: "📡",
  };

  return (
    <div className="border border-black rounded p-6 bg-white">
      {/* Header met titel en home icon */}
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-lg font-semibold text-black">{name}</h2>
        <Home className="w-6 h-6 text-black stroke-2" strokeWidth={2.5} />
      </div>

      {/* Device count */}
      <p className="text-sm text-zinc-700 mb-4">{deviceCount} devices</p>

      {/* Status */}
      <div className="mb-6 pb-4 border-b border-zinc-300">
        <p className="text-sm text-zinc-700">
          Status: <span className="font-semibold text-black">{activeDevices} / {deviceCount} ON</span>
        </p>
      </div>

      {/* Device icons */}
      <div className="flex gap-2 mb-6">
        {devices.map((device, index) => (
          <div
            key={index}
            className={`w-10 h-10 flex items-center justify-center rounded text-lg ${
              device.active
                ? "bg-black text-white"
                : "bg-white border border-black text-black"
            }`}
            title={device.name}
          >
            {device.icon || deviceIcons[device.type] || "⚙️"}
          </div>
        ))}
      </div>

      {/* View Details link */}
      <Link
        // Route gebruikt roomnaam als parameter voor detailpagina.
        to={`/rooms/${encodeURIComponent(name)}`}
        className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center gap-0 transition-colors"
      >
        View Details
        <span className="ml-1">›</span>
      </Link>
    </div>
  );
}
