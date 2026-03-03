import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, Lightbulb, Thermometer, Lock, Camera, Radio } from "lucide-react";
import { devicesService } from "@/services/devicesService";
import { roomsService } from "@/services/roomsService";
import { toast } from "sonner";

export default function RoomDetailPage() {
  const { roomId } = useParams();
  const [devices, setDevices] = useState([]);
  const [roomName, setRoomName] = useState("");
  const [temperatureByDevice, setTemperatureByDevice] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toggling, setToggling] = useState({});
  const [savingTemperature, setSavingTemperature] = useState({});
  const temperatureCommitTimersRef = useRef({});

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [roomsData, allDevices] = await Promise.all([roomsService.getRooms(), devicesService.getDevices()]);

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
          const roomIdFromDevice =
            device.room_id ??
            (typeof device.room === "object" && device.room !== null ? device.room.id : null) ??
            null;
          const roomNameFromDevice =
            (typeof device.room === "string" ? device.room : device.room?.name) || device.room_name || "";
          const state = typeof device.state === "object" && device.state !== null ? device.state : {};

          const isOnFromState = !!state.TURN_ON && !state.TURN_OFF;
          const status = typeof device.status === "string" ? device.status.toUpperCase() : isOnFromState ? "ON" : "OFF";

          const actionsFromDevice = Array.isArray(device.actions)
            ? device.actions
            : Array.isArray(device.type?.actions)
            ? device.type.actions
            : [];

          return {
            id: device.id,
            name: device.name || device.display_name || `Device ${device.id}`,
            type: mapType(typeName),
            status,
            active: status === "ON",
            icon: device.icon || null,
            roomId: roomIdFromDevice,
            roomName: roomNameFromDevice,
            state,
            actions: actionsFromDevice,
          };
        });

        const roomDevices = normalizedDevices.filter((device) => {
          if (targetRoomId !== null && targetRoomId !== undefined) {
            return String(device.roomId) === String(targetRoomId);
          }
          return String(device.roomName || "").toLowerCase() === roomParamLower;
        });

        setDevices(roomDevices);
        setTemperatureByDevice((prev) => {
          const next = {};
          roomDevices.forEach((device) => {
            const stateTemp = Number(
              device.state?.SET_TEMPERATURE ??
                device.state?.temperature ??
                device.state?.TEMP ??
                device.state?.temp
            );
            const boundedTemp = Number.isFinite(stateTemp) ? Math.max(10, Math.min(35, stateTemp)) : 22;
            next[device.id] = prev[device.id] ?? boundedTemp;
          });
          return next;
        });
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [roomId]);

  useEffect(() => {
    const timers = temperatureCommitTimersRef.current;
    return () => {
      Object.values(timers).forEach((timerId) => clearTimeout(timerId));
    };
  }, []);

  const getActionId = (device, actionName) => {
    const action = (device.actions || []).find(
      (item) => String(item?.name || "").toUpperCase() === String(actionName).toUpperCase()
    );
    return action?.id ?? null;
  };

  const handleToggleDevice = async (deviceId, currentStatus) => {
    const device = devices.find((d) => d.id === deviceId);
    if (!device) return;

    const newStatus = currentStatus === "ON" ? "OFF" : "ON";
    const turnOnActionId = getActionId(device, "TURN_ON");
    const turnOffActionId = getActionId(device, "TURN_OFF");
    const actionPayload =
      newStatus === "ON"
        ? turnOnActionId
          ? { actionId: turnOnActionId, value: true }
          : turnOffActionId
          ? { actionId: turnOffActionId, value: false }
          : null
        : turnOffActionId
        ? { actionId: turnOffActionId, value: true }
        : turnOnActionId
        ? { actionId: turnOnActionId, value: false }
        : null;

    try {
      setToggling((prev) => ({ ...prev, [deviceId]: true }));

      if (!actionPayload) {
        throw new Error("No valid power action configured for this device");
      }
      await devicesService.executeDeviceAction(deviceId, actionPayload.actionId, actionPayload.value);

      setDevices((prev) =>
        prev.map((d) =>
          d.id === deviceId
            ? {
                ...d,
                status: newStatus,
                active: newStatus === "ON",
                state: {
                  ...(d.state || {}),
                  TURN_ON: newStatus === "ON",
                  TURN_OFF: newStatus === "OFF",
                },
              }
            : d
        )
      );

      toast.success(`${device.name} turned ${newStatus}`);
    } catch (err) {
      toast.error(`Failed to toggle device: ${err.message}`);
    } finally {
      setToggling((prev) => ({ ...prev, [deviceId]: false }));
    }
  };

  const handleTemperatureChange = (deviceId, value) => {
    const nextValue = Number(value);

    setTemperatureByDevice((prev) => ({
      ...prev,
      [deviceId]: nextValue,
    }));

    const existingTimer = temperatureCommitTimersRef.current[deviceId];
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    temperatureCommitTimersRef.current[deviceId] = setTimeout(() => {
      commitTemperature(deviceId, nextValue);
    }, 250);
  };

  const commitTemperature = async (deviceId, explicitValue = null) => {
    const device = devices.find((d) => d.id === deviceId);
    if (!device) return;

    const actionId = getActionId(device, "SET_TEMPERATURE");
    if (!actionId) {
      toast.error("SET_TEMPERATURE action ontbreekt voor dit device");
      return;
    }

    const currentTemp = Number(explicitValue ?? temperatureByDevice[deviceId] ?? 22);

    try {
      setSavingTemperature((prev) => ({ ...prev, [deviceId]: true }));
      await devicesService.executeDeviceAction(deviceId, actionId, currentTemp);

      setDevices((prev) =>
        prev.map((d) =>
          d.id === deviceId
            ? {
                ...d,
                state: {
                  ...(d.state || {}),
                  SET_TEMPERATURE: currentTemp,
                },
              }
            : d
        )
      );
    } catch (err) {
      toast.error(`Failed to set temperature: ${err.message}`);
    } finally {
      setSavingTemperature((prev) => ({ ...prev, [deviceId]: false }));
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
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 text-sm">
        <ChevronLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-black mb-2">{roomName}</h1>
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
            const isToggling = toggling[device.id];
            const currentTemp = temperatureByDevice[device.id] ?? 22;
            const isSavingTemp = savingTemperature[device.id];

            return (
              <div key={device.id} className="border border-zinc-300 rounded p-6 bg-white hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 flex items-center justify-center rounded ${
                        device.active ? "bg-black text-white" : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      <IconComponent className="w-6 h-6" strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-black">{device.name}</h3>
                      <p className="text-sm text-zinc-500">{device.type}</p>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded text-sm font-medium border ${
                      device.active
                        ? "bg-green-50 text-green-700 border-green-300"
                        : "bg-zinc-100 text-zinc-600 border-zinc-300"
                    }`}
                  >
                    {device.status}
                  </div>
                </div>

                <div className="border-t border-zinc-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-700">Power</span>
                    <button
                      onClick={() => handleToggleDevice(device.id, device.status)}
                      disabled={isToggling}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        device.active ? "bg-black" : "bg-zinc-300"
                      } ${isToggling ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          device.active ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

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

                  {device.type === "THERMOSTAT" && (
                    <div className="mt-4 pt-4 border-t border-zinc-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-zinc-700">Temperature</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="10"
                          max="35"
                          step="1"
                          value={currentTemp}
                          onChange={(e) => handleTemperatureChange(device.id, e.target.value)}
                          onBlur={() => commitTemperature(device.id)}
                          className="flex-1 h-2 bg-zinc-300 rounded-lg appearance-none cursor-pointer"
                          disabled={isSavingTemp}
                        />
                        <span className="text-sm font-semibold text-black w-14 text-right">
                          {currentTemp}&deg;C
                        </span>
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
