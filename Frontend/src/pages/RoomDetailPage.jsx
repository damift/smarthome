import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ChevronLeft, Lightbulb, Thermometer, Lock, Camera, Radio } from "lucide-react";
import { devicesService } from "@/services/devicesService";
import { toast } from "sonner";

function normalizeType(raw) {
  const t = String(raw ?? "").trim().toUpperCase();
  const map = {
    LIGHT: "light",
    THERMOSTAT: "thermostat",
    CAMERA: "camera",
    LOCK: "lock",
    SENSOR: "motion",
    MOTION: "motion",
    OUTLET: "outlet",
  };
  return map[t] ?? "unknown";
}

function normalizeStatus(raw) {
  const s = String(raw ?? "").trim().toUpperCase();
  return s === "ON" ? "ON" : "OFF";
}

export default function RoomDetailPage() {
  const { roomId } = useParams(); // verwacht: /rooms/:roomId (numeriek)
  const numericRoomId = Number(roomId);

  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toggling, setToggling] = useState({});

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const allDevices = await devicesService.getDevices();
        const list = Array.isArray(allDevices) ? allDevices : [];

        // Normaliseer en pak room_id mee
        const normalized = list.map((d) => {
          const status = normalizeStatus(d.status);
          return {
            id: d.id,
            name: d.name ?? `Device ${d.id}`,
            room_id: d.room_id,          // <-- dit is de koppeling
            type: normalizeType(d.type), // <-- LIGHT -> light, etc.
            status,
            active: status === "ON",
            icon: d.icon ?? null,
          };
        });

        // Filter op room_id (nummer vergelijken)
        const roomDevices = normalized.filter((d) => Number(d.room_id) === numericRoomId);

        setDevices(roomDevices);
        setError(null);
      } catch (err) {
        console.error("RoomDetail fetch error:", err);
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    if (!Number.isFinite(numericRoomId)) {
      setError("Invalid room id in URL");
      setLoading(false);
      return;
    }

    fetchData();
  }, [numericRoomId]);

  const handleToggleDevice = async (deviceId) => {
    const device = devices.find((d) => d.id === deviceId);

    try {
      setToggling((prev) => ({ ...prev, [deviceId]: true }));
      await devicesService.toggleDevice(deviceId);

      setDevices((prev) =>
        prev.map((d) => {
          if (d.id !== deviceId) return d;
          const nextActive = !d.active;
          return { ...d, active: nextActive, status: nextActive ? "ON" : "OFF" };
        })
      );

      toast.success(`${device?.name ?? "Device"} turned ${device?.active ? "OFF" : "ON"}`);
    } catch (err) {
      toast.error(`Failed to toggle device: ${err.message}`);
    } finally {
      setToggling((prev) => ({ ...prev, [deviceId]: false }));
    }
  };

  const deviceIcons = {
    light: Lightbulb,
    thermostat: Thermometer,
    lock: Lock,
    camera: Camera,
    motion: Radio,
    outlet: Radio,
    unknown: Radio,
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
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6">
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
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 text-sm"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-black mb-2">Room #{numericRoomId}</h1>
        <p className="text-sm text-zinc-600">{devices.length} devices</p>
      </div>

      <div className="mb-8 pb-4 border-b border-zinc-300">
        <p className="text-sm text-zinc-700">
          Status: <span className="font-semibold text-black">{activeCount} / {devices.length} ON</span>
        </p>
      </div>

      {devices.length === 0 ? (
        <p className="text-zinc-500">No devices in this room</p>
      ) : (
        <div className="space-y-4">
          {devices.map((device) => {
            const IconComponent = deviceIcons[device.type] || Radio;
            const isLoading = !!toggling[device.id];

            return (
              <div key={device.id} className="border border-zinc-300 rounded p-6 bg-white hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 flex items-center justify-center rounded ${device.active ? "bg-black text-white" : "bg-zinc-100 text-zinc-500"}`}>
                      <IconComponent className="w-6 h-6" strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-black">{device.name}</h3>
                      <p className="text-sm text-zinc-500">{device.type}</p>
                    </div>
                  </div>

                  <div className={`px-3 py-1 rounded text-sm font-medium border ${device.active ? "bg-green-50 text-green-700 border-green-300" : "bg-zinc-100 text-zinc-600 border-zinc-300"}`}>
                    {device.status}
                  </div>
                </div>

                <div className="border-t border-zinc-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-700">Power</span>
                    <button
                      onClick={() => handleToggleDevice(device.id)}
                      disabled={isLoading}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${device.active ? "bg-black" : "bg-zinc-300"} ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${device.active ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}