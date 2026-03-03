import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ChevronLeft, Lightbulb, Thermometer, Lock, Camera, Radio } from "lucide-react";
import { devicesService } from "@/services/devicesService";
import { roomsService } from "@/services/roomsService";
import { toast } from "sonner";

export default function RoomDetailPage() {
  const { roomId } = useParams();
  const [devices, setDevices] = useState([]);
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toggling, setToggling] = useState({});

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [roomsData, allDevices] = await Promise.all([
          roomsService.getRooms(),
          devicesService.getDevices(),
        ]);

        const roomList = Array.isArray(roomsData) ? roomsData : roomsData?.data || [];
        const deviceList = Array.isArray(allDevices) ? allDevices : allDevices?.data || [];

        const roomParam = decodeURIComponent(roomId || "").trim();
        const roomParamLower = roomParam.toLowerCase();
        const roomByRoute =
          roomList.find((room) => String(room.id) === roomParam) ||
          roomList.find((room) => String(room.name || "").toLowerCase() === roomParamLower);

        const targetRoomId = roomByRoute?.id ?? null;
        const targetRoomName = roomByRoute?.name || roomParam;
        setRoomName(targetRoomName);

        const mapType = (rawType) => {
          const value = String(rawType || "").toUpperCase();
          if (value.includes("THERMOSTAT")) return "THERMOSTAT";
          if (value.includes("LIGHT") || value.includes("LAMP")) return "LIGHT";
          if (value.includes("LOCK")) return "LOCK";
          if (value.includes("CAMERA") || value.includes("CAM")) return "CAMERA";
          return "SENSOR";
        };

        const normalizedDevices = deviceList.map((device) => {
          const typeName = device.type?.name || device.type || device.device_type;
          const roomIdFromDevice = device.room_id ?? device.room?.id ?? null;
          const roomNameFromDevice = device.room?.name ?? device.room_name ?? "";
          const status =
            typeof device.status === "string"
              ? device.status.toUpperCase()
              : device.active || device.state?.TURN_ON
              ? "ON"
              : "OFF";

          return {
            id: device.id,
            name: device.name || device.display_name || `Device ${device.id}`,
            type: mapType(typeName),
            status,
            active: status === "ON",
            icon: device.icon || null,
            roomId: roomIdFromDevice,
            roomName: roomNameFromDevice,
            state: device.state || null,
          };
        });

        const roomDevices = normalizedDevices.filter((device) => {
          if (targetRoomId !== null && targetRoomId !== undefined) {
            return String(device.roomId) === String(targetRoomId);
          }
          return String(device.roomName || "").toLowerCase() === roomParamLower;
        });

        setDevices(roomDevices);
        setError(null);
      } catch (err) {
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

  const activeCount = devices.filter((d) => d.active).length;

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
