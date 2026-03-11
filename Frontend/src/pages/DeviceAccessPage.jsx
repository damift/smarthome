import React from "react";
import { toast } from "sonner";
import { deviceAccessService } from "@/services/deviceAccessService";
import { logout } from "@/lib/auth";
import LoadingState from "@/components/ui/LoadingState";

// Zet input om naar schone lijst van geldige numerieke device-ids.
function toNumberArray(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item > 0);
}

export default function DeviceAccessPage() {
  const [users, setUsers] = React.useState([]);
  const [devices, setDevices] = React.useState([]);
  const [userDeviceMap, setUserDeviceMap] = React.useState({});
  const [selectedUserId, setSelectedUserId] = React.useState("");
  const [selectedDeviceIds, setSelectedDeviceIds] = React.useState(new Set());
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  const selectedUser = React.useMemo(
    () => users.find((user) => String(user.id) === String(selectedUserId)) || null,
    [users, selectedUserId],
  );

  React.useEffect(() => {
    // Laadt initiële data en kiest standaard de eerste user.
    async function loadData() {
      try {
        setLoading(true);
        setError("");
        const data = await deviceAccessService.getOverview();

        const nextUsers = Array.isArray(data?.users) ? data.users : [];
        const nextDevices = Array.isArray(data?.devices) ? data.devices : [];
        const nextMap = data?.user_device_map && typeof data.user_device_map === "object"
          ? data.user_device_map
          : {};

        setUsers(nextUsers);
        setDevices(nextDevices);
        setUserDeviceMap(nextMap);

        if (nextUsers.length > 0) {
          const firstUserId = String(nextUsers[0].id);
          setSelectedUserId(firstUserId);
          setSelectedDeviceIds(new Set(toNumberArray(nextMap[firstUserId])));
        }
      } catch (err) {
        console.error("Failed to load device access overview:", err);
        if (err?.status === 401) {
          logout();
          toast.error("Je sessie is verlopen. Log opnieuw in.");
          window.location.replace("/login");
          return;
        }

        if (err?.status === 403) {
          setError("Alleen admins kunnen device-toegang beheren.");
          return;
        }

        setError(err.message || "Failed to load access data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  React.useEffect(() => {
    // Houdt de checkbox-selectie synchroon met de gekozen gebruiker.
    if (!selectedUserId) {
      setSelectedDeviceIds(new Set());
      return;
    }

    const granted = toNumberArray(userDeviceMap[String(selectedUserId)]);
    setSelectedDeviceIds(new Set(granted));
  }, [selectedUserId, userDeviceMap]);

  function toggleDevice(deviceId) {
    // Toggle één device-id in de lokale selectie.
    setSelectedDeviceIds((prev) => {
      const next = new Set(prev);
      if (next.has(deviceId)) next.delete(deviceId);
      else next.add(deviceId);
      return next;
    });
  }

  function selectAllDevices() {
    // Selecteert alle zichtbare devices voor de huidige user.
    setSelectedDeviceIds(new Set(devices.map((device) => Number(device.id))));
  }

  function clearAllDevices() {
    // Maakt de huidige selectie leeg.
    setSelectedDeviceIds(new Set());
  }

  async function saveAccess() {
    // Persist selected ids naar backend en update lokale mapping.
    if (!selectedUserId) return;

    try {
      setSaving(true);

      const ids = Array.from(selectedDeviceIds).sort((a, b) => a - b);
      await deviceAccessService.updateUserAccess(selectedUserId, ids);

      setUserDeviceMap((prev) => ({
        ...prev,
        [String(selectedUserId)]: ids,
      }));

      toast.success("Device-toegang opgeslagen");
    } catch (err) {
      console.error("Failed to update user device access:", err);
      if (err?.status === 401) {
        logout();
        toast.error("Je sessie is verlopen. Log opnieuw in.");
        window.location.replace("/login");
        return;
      }

      toast.error(err.message || "Opslaan mislukt");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingState message="Loading access data..." />;
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Device Access</h1>
        <p className="text-zinc-400">Geef users toegang tot specifieke devices of haal die weg.</p>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="grid gap-3 md:grid-cols-[260px_1fr] md:items-center">
          <label htmlFor="user-select" className="text-sm font-medium text-zinc-700">
            Gebruiker
          </label>
          <select
            id="user-select"
            className="w-full rounded-md border px-3 py-2"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            {users.map((user) => (
              <option key={user.id} value={String(user.id)}>
                {user.name || user.email} ({user.email})
              </option>
            ))}
          </select>
        </div>

        {selectedUser && (
          <div className="rounded-md border bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
            Geselecteerd: <span className="font-medium text-zinc-900">{selectedUser.name || selectedUser.email}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-md border px-3 py-1.5 text-sm"
            onClick={selectAllDevices}
          >
            Alles selecteren
          </button>
          <button
            type="button"
            className="rounded-md border px-3 py-1.5 text-sm"
            onClick={clearAllDevices}
          >
            Alles deselecteren
          </button>
        </div>

        <div className="max-h-[420px] overflow-y-auto rounded-md border">
          {devices.length === 0 ? (
            <div className="p-4 text-sm text-zinc-500">Geen devices gevonden.</div>
          ) : (
            <ul className="divide-y">
              {devices.map((device) => {
                const id = Number(device.id);
                const isChecked = selectedDeviceIds.has(id);
                return (
                  <li key={device.id} className="flex items-center justify-between gap-4 p-3">
                    <div>
                      <div className="font-medium text-zinc-900">{device.name}</div>
                      <div className="text-xs text-zinc-500">{device.room || "Onbekende kamer"}</div>
                    </div>
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleDevice(id)}
                      />
                      Toegang
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-zinc-500">
            {selectedDeviceIds.size} van {devices.length} devices geselecteerd
          </div>
          <button
            type="button"
            className="rounded-md bg-zinc-900 px-4 py-2 text-white disabled:opacity-50"
            disabled={saving || !selectedUserId}
            onClick={saveAccess}
          >
            {saving ? "Opslaan..." : "Toegang opslaan"}
          </button>
        </div>
      </div>
    </div>
  );
}
