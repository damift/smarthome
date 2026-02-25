import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ChevronLeft, Lightbulb, Thermometer, Lock, Camera, Radio } from "lucide-react";
import { devicesService } from "@/services/devicesService";
import { toast } from "sonner";

export default function RoomDetailPage() {
  const { roomId } = useParams();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toggling, setToggling] = useState({});

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const allDevices = await devicesService.getDevices();
        console.log("All devices from API:", allDevices);
        
        // Normalize devices (same as Dashboard)
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

        const normalizedDevices = (allDevices || []).map(d => {
          const rawType = (d.type || d.device_type || "").toString();
          const mappedType = typeMap[rawType] || typeMap[rawType.toUpperCase?.()] || "unknown";
          
          return {
            id: d.id,
            name: d.name || d.display_name || d.type || `Device ${d.id}`,
            type: mappedType,
            status: d.status || (d.active ? "ON" : "OFF"),
            active: (typeof d.status === "string" ? d.status.toLowerCase() === "on" : !!d.active),
            icon: d.icon || null,
            room: d.room || d.room_name || "",
          };
        });

        console.log("Normalized devices:", normalizedDevices);
        const roomNameDecoded = decodeURIComponent(roomId);
        console.log("Looking for room:", roomNameDecoded);
        
        // Filter devices by room name
        const roomDevices = normalizedDevices.filter(d => {
          console.log(`Checking device "${d.name}" with room="${d.room}" against "${roomNameDecoded}"`);
          return d.room === roomNameDecoded;
        });
        
        console.log("Filtered room devices:", roomDevices);
        setDevices(roomDevices);
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [roomId]);

  const handleToggleDevice = async (deviceId, currentStatus) => {
    try {
      setToggling(prev => ({ ...prev, [deviceId]: true }));
      await devicesService.toggleDevice(deviceId);
      
      setDevices(prev =>
        prev.map(d =>
          d.id === deviceId
            ? { ...d, status: currentStatus === "ON" ? "OFF" : "ON", active: !d.active }
            : d
        )
      );
      
      const device = devices.find(d => d.id === deviceId);
      const newStatus = currentStatus === "ON" ? "OFF" : "ON";
      toast.success(`${device.name} turned ${newStatus}`);
    } catch (err) {
      toast.error(`Failed to toggle device: ${err.message}`);
    } finally {
      setToggling(prev => ({ ...prev, [deviceId]: false }));
    }
  };

  const deviceIcons = {
    LIGHT: Lightbulb,
    THERMOSTAT: Thermometer,
    LOCK: Lock,
    CAMERA: Camera,
    SENSOR: Radio,
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white p-6 flex items-center justify-center">
        <p className="text-zinc-500">Loading room details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-white p-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <p className="text-red-500">Error loading room: {error}</p>
      </div>
    );
  }

  const activeCount = devices.filter(d => d.active).length;
  const roomName = decodeURIComponent(roomId);

  return (
    <div className="w-full min-h-screen bg-white p-6">
      {/* Header */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 text-sm"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-black mb-2">{roomName}</h1>
        <p className="text-sm text-zinc-600">{devices.length} devices</p>
      </div>

      {/* Status summary */}
      <div className="mb-8 pb-4 border-b border-zinc-300">
        <p className="text-sm text-zinc-700">
          Status: <span className="font-semibold text-black">{activeCount} / {devices.length} ON</span>
        </p>
      </div>

      {/* Devices grid */}
      {devices.length === 0 ? (
        <p className="text-zinc-500">No devices in this room</p>
      ) : (
        <div className="space-y-4">
          {devices.map(device => {
            const IconComponent = deviceIcons[device.type] || Radio;
            const isLoading = toggling[device.id];

            return (
              <div
                key={device.id}
                className="border border-zinc-300 rounded p-6 bg-white hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 flex items-center justify-center rounded ${
                      device.active
                        ? "bg-black text-white"
                        : "bg-zinc-100 text-zinc-500"
                    }`}>
                      <IconComponent className="w-6 h-6" strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-black">{device.name}</h3>
                      <p className="text-sm text-zinc-500">{device.type}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded text-sm font-medium border ${
                    device.active
                      ? "bg-green-50 text-green-700 border-green-300"
                      : "bg-zinc-100 text-zinc-600 border-zinc-300"
                  }`}>
                    {device.status}
                  </div>
                </div>

                <div className="border-t border-zinc-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-700">Power</span>
                    <button
                      onClick={() => handleToggleDevice(device.id, device.status)}
                      disabled={isLoading}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        device.active
                          ? "bg-black"
                          : "bg-zinc-300"
                      } ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          device.active ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Brightness slider for lights */}
                  {device.type === "LIGHT" && (
                    <div className="mt-4 pt-4 border-t border-zinc-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-zinc-700">Brightness</span>
                        <span className="text-sm text-zinc-600">80%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        defaultValue="80"
                        className="w-full h-2 bg-zinc-300 rounded-lg appearance-none cursor-pointer"
                        disabled={!device.active}
                      />
                    </div>
                  )}

                  {/* Temperature display for thermostats */}
                  {device.type === "THERMOSTAT" && (
                    <div className="mt-4 pt-4 border-t border-zinc-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-zinc-700">Temperature</span>
                        <span className="text-sm font-semibold text-black">22°C</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}