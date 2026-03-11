import { Link } from "react-router-dom";
import {
  Camera,
  Cpu,
  Home,
  Lightbulb,
  Lock,
  Plug,
  Radio,
  Thermometer,
} from "lucide-react";

function getDeviceIcon(type) {
  const value = String(type ?? "").toUpperCase();

  if (value.includes("LIGHT") || value.includes("LAMP")) return Lightbulb;
  if (value.includes("THERMOSTAT") || value.includes("TEMP")) return Thermometer;
  if (value.includes("LOCK")) return Lock;
  if (value.includes("CAMERA") || value.includes("CAM")) return Camera;
  if (value.includes("OUTLET") || value.includes("PLUG")) return Plug;
  if (value.includes("SENSOR") || value.includes("MOTION")) return Radio;

  return Cpu;
}

export default function RoomCard({
  name,
  deviceCount,
  activeDevices,
  devices = [],
}) {
  return (
    <div className="rounded border border-black bg-white p-6">
      <div className="mb-4 flex items-start justify-between">
        <h2 className="text-lg font-semibold text-black">{name}</h2>
        <Home className="h-6 w-6 text-black" strokeWidth={2.5} />
      </div>

      <p className="mb-4 text-sm text-zinc-700">{deviceCount} devices</p>

      <div className="mb-6 border-b border-zinc-300 pb-4">
        <p className="text-sm text-zinc-700">
          Status: <span className="font-semibold text-black">{activeDevices} / {deviceCount} ON</span>
        </p>
      </div>

      <div className="mb-6 flex gap-2">
        {devices.map((device, index) => {
          const Icon = getDeviceIcon(device.type);

          return (
            <div
              key={index}
              className={`flex h-10 w-10 items-center justify-center rounded ${
                device.active
                  ? "bg-black text-white"
                  : "border border-black bg-white text-black"
              }`}
              title={device.name}
            >
              {device.icon ? <span>{device.icon}</span> : <Icon className="h-5 w-5" strokeWidth={2} />}
            </div>
          );
        })}
      </div>

      <Link
        to={`/rooms/${encodeURIComponent(name)}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-800"
      >
        View Details
        <span>&gt;</span>
      </Link>
    </div>
  );
}
