import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, Lightbulb, Thermometer, Lock, Camera, Radio } from "lucide-react";
import { devicesService } from "@/services/devicesService";
import { roomsService } from "@/services/roomsService";
import { toast } from "sonner";

// Power-actions gebruiken we ook voor statusbadges (ON/OFF).
const POWER_ACTIONS = new Set(["TURN_ON", "TURN_OFF"]);

// Uniforme value_type parser, want backend kan mixed casing teruggeven.
function getValueType(action) {
  return String(action?.value_type || "").toUpperCase();
}

function isBooleanAction(action) {
  return getValueType(action) === "BOOLEAN";
}

function isSliderAction(action) {
  const type = getValueType(action);
  return type === "INT" || type === "DECIMAL";
}

function isStringAction(action) {
  return getValueType(action) === "STRING";
}

function getActionName(action) {
  return String(action?.name || "").toUpperCase();
}

function isPowerAction(action) {
  return POWER_ACTIONS.has(getActionName(action));
}

// Zet action keys zoals SET_TEMPERATURE om naar leesbare labels.
function formatActionLabel(name) {
  return String(name || "")
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function RoomDetailPage() {
  const { roomId } = useParams();
  // devices bevat de genormaliseerde records + actions/state voor dynamisch renderen.
  const [devices, setDevices] = useState([]);
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingActions, setSavingActions] = useState({});
  const actionCommitTimersRef = useRef({});

  useEffect(() => {
    // Bouwt room-details op vanuit rooms + devices en normaliseert backendverschillen.
    async function fetchData() {
      try {
        setLoading(true);
        const [roomsData, allDevices] = await Promise.all([roomsService.getRooms(), devicesService.getDevices()]);

        const roomList = Array.isArray(roomsData) ? roomsData : roomsData?.data || [];
        const deviceList = Array.isArray(allDevices) ? allDevices : allDevices?.data || [];

        const roomParam = decodeURIComponent(roomId || "").trim();
        const roomParamLower = roomParam.toLowerCase();
        // Ondersteunt zowel route op room-id als room-naam.
        const roomByRoute =
          roomList.find((room) => String(room.id) === roomParam) ||
          roomList.find((room) => String(room.name || "").toLowerCase() === roomParamLower);

        const targetRoomId = roomByRoute?.id ?? null;
        const targetRoomName = roomByRoute?.name || roomParam;
        setRoomName(targetRoomName);

        // Mapt backend type-labels naar stabiele UI-categorieen.
        const mapType = (rawType) => {
          const value = String(rawType || "").toUpperCase();
          if (value.includes("THERMOSTAT")) return "THERMOSTAT";
          if (value.includes("LIGHT") || value.includes("LAMP")) return "LIGHT";
          if (value.includes("LOCK")) return "LOCK";
          if (value.includes("CAMERA") || value.includes("CAM")) return "CAMERA";
          return "SENSOR";
        };

        // Maakt van elk device een uniform object voor deze pagina.
        const normalizedDevices = deviceList.map((device) => {
          const typeName = device.type?.name || device.type || device.device_type;
          const roomIdFromDevice =
            device.room_id ??
            (typeof device.room === "object" && device.room !== null ? device.room.id : null) ??
            null;
          const roomNameFromDevice =
            (typeof device.room === "string" ? device.room : device.room?.name) || device.room_name || "";
          const state = typeof device.state === "object" && device.state !== null ? device.state : {};

          const activeFromState = !!state.TURN_ON && !state.TURN_OFF;
          const status = typeof device.status === "string" ? device.status.toUpperCase() : activeFromState ? "ON" : "OFF";

          // Prefer device.actions; fallback naar type.actions als backend dat zo terugstuurt.
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
    // Ruimt pending debounce timers op bij unmount.
    const timers = actionCommitTimersRef.current;
    return () => {
      Object.values(timers).forEach((timerId) => clearTimeout(timerId));
    };
  }, []);

  // Unieke sleutel per action-control voor loading/timer state.
  const getActionKey = (deviceId, actionId) => `${deviceId}:${actionId}`;

  const getCurrentActionValue = (device, action) => {
    // Waarde komt altijd uit device.state[action.name].
    const raw = device.state?.[action.name];
    if (raw !== undefined && raw !== null) return raw;

    if (isBooleanAction(action)) return false;
    if (isSliderAction(action)) return 0;
    return "";
  };

  const getSliderConfig = (action) => {
    const actionName = String(action?.name || "").toUpperCase();
    const minFromAction = Number(action?.min);
    const maxFromAction = Number(action?.max);
    const type = getValueType(action);

    // Gebruik backend min/max indien aanwezig, anders domijnspecifieke defaults.
    const fallbackMin = actionName.includes("TEMPERATURE") ? 10 : 0;
    const fallbackMax = actionName.includes("TEMPERATURE") ? 35 : 100;

    return {
      min: Number.isFinite(minFromAction) ? minFromAction : fallbackMin,
      max: Number.isFinite(maxFromAction) ? maxFromAction : fallbackMax,
      step: type === "DECIMAL" ? 0.5 : 1,
    };
  };

  const applyLocalActionValue = (deviceId, actionName, value) => {
    // Optimistic UI update: toon direct nieuwe waarde voordat request klaar is.
    setDevices((prev) =>
      prev.map((device) => {
        if (device.id !== deviceId) return device;

        const nextState = {
          ...(device.state || {}),
          [actionName]: value,
        };

        // Houdt status-badge synchroon wanneer power-actions wijzigen.
        if (POWER_ACTIONS.has(actionName)) {
          const nextActive = !!nextState.TURN_ON && !nextState.TURN_OFF;
          return {
            ...device,
            state: nextState,
            active: nextActive,
            status: nextActive ? "ON" : "OFF",
          };
        }

        return {
          ...device,
          state: nextState,
        };
      })
    );
  };

  const applyLocalPowerState = (deviceId, nextActive) => {
    // Houd TURN_ON en TURN_OFF lokaal in sync voor 1 duidelijke power-toggle.
    setDevices((prev) =>
      prev.map((device) => {
        if (device.id !== deviceId) return device;

        return {
          ...device,
          state: {
            ...(device.state || {}),
            TURN_ON: nextActive,
            TURN_OFF: !nextActive,
          },
          active: nextActive,
          status: nextActive ? "ON" : "OFF",
        };
      })
    );
  };

  const executeAction = async (deviceId, action, value) => {
    const actionKey = getActionKey(deviceId, action.id);
    try {
      setSavingActions((prev) => ({ ...prev, [actionKey]: true }));
      // Alle action writes lopen via de execute endpoint.
      await devicesService.executeDeviceAction(deviceId, action.id, value);
    } catch (err) {
      toast.error(`Failed to execute ${action.name}: ${err.message}`);
    } finally {
      setSavingActions((prev) => ({ ...prev, [actionKey]: false }));
    }
  };

  const scheduleActionCommit = (deviceId, action, value, delayMs = 250) => {
    // Debounce voor sliders om request-spam te voorkomen tijdens slepen.
    const timerKey = getActionKey(deviceId, action.id);
    const existingTimer = actionCommitTimersRef.current[timerKey];
    if (existingTimer) clearTimeout(existingTimer);

    actionCommitTimersRef.current[timerKey] = setTimeout(() => {
      executeAction(deviceId, action, value);
    }, delayMs);
  };

  const flushActionCommit = (deviceId, action, value) => {
    // Force immediate save (bijv. bij blur).
    const timerKey = getActionKey(deviceId, action.id);
    const existingTimer = actionCommitTimersRef.current[timerKey];
    if (existingTimer) clearTimeout(existingTimer);
    executeAction(deviceId, action, value);
  };

  const handleBooleanActionToggle = (device, action) => {
    const current = Boolean(getCurrentActionValue(device, action));
    const nextValue = !current;
    applyLocalActionValue(device.id, action.name, nextValue);
    flushActionCommit(device.id, action, nextValue);
  };

  const handlePowerToggle = (device, powerOnAction, powerOffAction) => {
    const nextActive = !device.active;
    applyLocalPowerState(device.id, nextActive);

    if (nextActive) {
      if (powerOnAction) {
        flushActionCommit(device.id, powerOnAction, true);
        return;
      }
      if (powerOffAction) {
        flushActionCommit(device.id, powerOffAction, false);
      }
      return;
    }

    if (powerOffAction) {
      flushActionCommit(device.id, powerOffAction, true);
      return;
    }
    if (powerOnAction) {
      flushActionCommit(device.id, powerOnAction, false);
    }
  };

  const handleSliderActionChange = (device, action, rawValue) => {
    const parsed = Number(rawValue);
    applyLocalActionValue(device.id, action.name, parsed);
    scheduleActionCommit(device.id, action, parsed);
  };

  const handleStringActionChange = (device, action, rawValue) => {
    applyLocalActionValue(device.id, action.name, rawValue);
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
            const deviceActions = Array.isArray(device.actions) ? device.actions : [];
            const powerOnAction = deviceActions.find((action) => getActionName(action) === "TURN_ON");
            const powerOffAction = deviceActions.find((action) => getActionName(action) === "TURN_OFF");
            const hasPowerAction = Boolean(powerOnAction || powerOffAction);
            const isPowerSaving = [powerOnAction, powerOffAction]
              .filter(Boolean)
              .some((action) => !!savingActions[getActionKey(device.id, action.id)]);
            const nonPowerActions = deviceActions.filter((action) => !isPowerAction(action));

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
                  {hasPowerAction && (
                    <div
                      className={`px-3 py-1 rounded text-sm font-medium border ${
                        device.active
                          ? "bg-green-50 text-green-700 border-green-300"
                          : "bg-zinc-100 text-zinc-600 border-zinc-300"
                      }`}
                    >
                      {device.status}
                    </div>
                  )}
                </div>

                <div className="border-t border-zinc-200 pt-4 space-y-4">
                  {!hasPowerAction && nonPowerActions.length === 0 && (
                    <p className="text-sm text-zinc-500">No controls available for this device.</p>
                  )}

                  {hasPowerAction && (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-zinc-700">Power</p>
                        <p className="text-xs text-zinc-500">Zet het apparaat aan of uit</p>
                      </div>
                      <button
                        onClick={() => handlePowerToggle(device, powerOnAction, powerOffAction)}
                        disabled={isPowerSaving}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          device.active ? "bg-black" : "bg-zinc-300"
                        } ${isPowerSaving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            device.active ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  )}

                  {/* Dynamische action-renderer op basis van value_type uit de database. */}
                  {nonPowerActions.map((action) => {
                    const actionKey = getActionKey(device.id, action.id);
                    const isSaving = !!savingActions[actionKey];
                    const currentValue = getCurrentActionValue(device, action);

                    if (isBooleanAction(action)) {
                      // BOOLEAN => toggle.
                      return (
                        <div key={action.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-zinc-700">{formatActionLabel(action.name)}</p>
                            {action.description && <p className="text-xs text-zinc-500">{action.description}</p>}
                          </div>
                          <button
                            onClick={() => handleBooleanActionToggle(device, action)}
                            disabled={isSaving}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              currentValue ? "bg-black" : "bg-zinc-300"
                            } ${isSaving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                currentValue ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                      );
                    }

                    if (isSliderAction(action)) {
                      // INT/DECIMAL => slider met min/max uit action metadata.
                      const { min, max, step } = getSliderConfig(action);
                      const numericValue = Number(currentValue ?? 0);
                      const unit = String(action.name || "").toUpperCase().includes("TEMPERATURE") ? "\u00B0C" : "%";

                      return (
                        <div key={action.id}>
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <p className="text-sm text-zinc-700">{formatActionLabel(action.name)}</p>
                              {action.description && <p className="text-xs text-zinc-500">{action.description}</p>}
                            </div>
                            <span className="text-sm font-semibold text-black w-16 text-right">
                              {numericValue}
                              {unit}
                            </span>
                          </div>
                          <input
                            type="range"
                            min={min}
                            max={max}
                            step={step}
                            value={numericValue}
                            onChange={(e) => handleSliderActionChange(device, action, e.target.value)}
                            onBlur={() => flushActionCommit(device.id, action, numericValue)}
                            className="w-full h-2 bg-zinc-300 rounded-lg appearance-none cursor-pointer"
                            disabled={isSaving}
                          />
                        </div>
                      );
                    }

                    if (isStringAction(action)) {
                      // STRING => text input.
                      return (
                        <div key={action.id}>
                          <label className="text-sm text-zinc-700 block mb-2">{formatActionLabel(action.name)}</label>
                          {action.description && <p className="text-xs text-zinc-500 mb-2">{action.description}</p>}
                          <input
                            type="text"
                            value={String(currentValue ?? "")}
                            onChange={(e) => handleStringActionChange(device, action, e.target.value)}
                            onBlur={(e) => flushActionCommit(device.id, action, e.target.value)}
                            className="w-full rounded-md border px-3 py-2 bg-white"
                            disabled={isSaving}
                          />
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
