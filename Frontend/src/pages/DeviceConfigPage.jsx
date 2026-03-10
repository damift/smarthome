import React, { useState, useEffect } from "react";
import { Button } from "@/components/shadcn/button";
import DeviceList from "@/components/DeviceList";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/shadcn/dialog";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { devicesService } from "../services/devicesService";
import { toast } from "sonner";
import { roomsService } from "../services/roomsService";
import { typesService } from "../services/typesService";
import LoadingState from "@/components/ui/LoadingState";

export default function DeviceConfigPage() {
  const [devices, setDevices] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [types, setTypes] = useState([]);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: "", type_id: null, room_id: "", status: "OFF" });
  const [editForm, setEditForm] = useState({ name: "", type_id: null, room_id: "", status: "OFF" });

  // Haalt devices, rooms en types op zodra de pagina opent.
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [devicesData, roomsData, typesData] = await Promise.all([
        devicesService.getDevices(),
        roomsService.getRooms(),
        typesService.getTypes(),
      ]);
      // Verrijkt device records met leesbare room/type labels voor de tabel.
      const enrichedDevices = devicesData.map((device) => {
        const room = roomsData.find((r) => r.id === device.room_id);
        const typeObj = typesData.find((t) => t.id === device.type_id);
        return {
          ...device,
          room: room?.name || "Unknown Room",
          type: typeObj?.name || device.type || "",
        };
      });
      setDevices(enrichedDevices);
      setRooms(roomsData);
      setTypes(typesData);
      // Zet standaard selectiewaarden zodat forms direct bruikbaar zijn.
      if (roomsData && roomsData.length > 0) {
        setForm((f) => ({ ...f, room_id: roomsData[0].id.toString() }));
        setEditForm((f) => ({ ...f, room_id: roomsData[0].id.toString() }));
      }
      if (typesData && typesData.length > 0) {
        setForm((f) => ({ ...f, type_id: typesData[0].id }));
        setEditForm((f) => ({ ...f, type_id: typesData[0].id }));
      }
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    // Verwijdert een device en houdt de UI-lijst direct synchroon.
    if (!confirm("Delete device?")) return;
    try {
      await devicesService.deleteDevice(id);
      setDevices((d) => d.filter((x) => x.id !== id));
      toast.success("Device deleted");
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Failed to delete device");
      console.error("Failed to delete device:", err);
    }
  }

  function handleEdit(id) {
    // Laadt bestaande waarden in de edit modal.
    const device = devices.find((d) => d.id === id);
    if (device) {
      setEditingDevice(device);
      setEditForm({
        name: device.name,
        type_id: device.type_id,
        room_id: device.room_id.toString(),
        status: device.status,
      });
      setEditOpen(true);
    }
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    
    if (!editingDevice || !editForm.room_id) {
      setError("Please select a room");
      return;
    }

    try {
      const updatedData = {
        name: editForm.name,
        type_id: editForm.type_id,
        room_id: parseInt(editForm.room_id),
        status: editForm.status,
      };
      
      const response = await devicesService.updateDevice(editingDevice.id, updatedData);
      
      // Schrijft de bijgewerkte device terug in de lokale lijst.
      const room = rooms.find((r) => r.id === parseInt(editForm.room_id));
      const typeObj = types.find((t) => t.id === response.device.type_id);
      const updatedDevice = {
        ...response.device,
        room: room?.name || "Unknown Room",
        type: typeObj?.name || response.device.type || "",
      };
      
      setDevices((d) =>
        d.map((device) => (device.id === editingDevice.id ? updatedDevice : device))
      );
      
      setEditOpen(false);
      setEditingDevice(null);
      setError(null);
    } catch (err) {
      console.error("Full error object:", err);
      setError(err.message || "Failed to update device");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Voorkomt submit zonder room-koppeling.
    if (!form.room_id) {
      setError("Please select a room");
      return;
    }

    try {
      setCreating(true);
      const newDevice = {
        name: form.name || `Device ${devices.length + 1}`,
        type_id: form.type_id,
        room_id: parseInt(form.room_id),
        status: form.status,
      };
      console.log("Creating device with:", newDevice);
      
      const response = await devicesService.createDevice(newDevice);
      console.log("Device created response:", response);
      
      // Voegt labels toe zodat de nieuwe rij direct correct rendert.
      const room = rooms.find((r) => r.id === parseInt(form.room_id));
      const typeObj = types.find((t) => t.id === response.device.type_id);
      const enrichedDevice = {
        ...response.device,
        room: room?.name || "Unknown Room",
        type: typeObj?.name || response.device.type || "",
      };
      
      setDevices((d) => [...d, enrichedDevice]);
      setForm({ name: "", type_id: types.length > 0 ? types[0].id : null, room_id: rooms.length > 0 ? rooms[0].id.toString() : "", status: "OFF" });
      setOpen(false);
      setError(null);
      toast.success("Device created");
    } catch (err) {
      console.error("Full error object:", err);
      setError(err.message || "Failed to create device");
      toast.error(err.message || "Failed to create device");
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return <LoadingState variant="page" fullScreen message="Loading devices..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-50">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading devices</p>
          <p className="text-zinc-600">{error}</p>
          <button onClick={fetchData} className="mt-4 px-4 py-2 rounded-md bg-zinc-900 text-white">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Device Configuration</h1>
          <p className="text-zinc-400">Manage all smart devices in the system</p>
        </div>

        <div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="default">➕ Add Device</Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Device</DialogTitle>
                <DialogDescription>Manage device name, type and room.</DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Device Name</Label>
                  <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Main Ceiling Light" />
                </div>
                <div>
                  <Label>Type</Label>
                  <select
                    className="mt-1 w-full rounded-md border px-3 py-2"
                    value={form.type_id || ""}
                    onChange={(e) => setForm((f) => ({ ...f, type_id: parseInt(e.target.value) }))}
                  >
                    <option value="">Select a type</option>
                    {types.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Room</Label>
                  <select 
                    className="mt-1 w-full rounded-md border px-3 py-2" 
                    value={form.room_id} 
                    onChange={(e) => setForm((f) => ({ ...f, room_id: e.target.value }))}
                  >
                    <option value="">Select a room</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id.toString()}>
                        {room.name}
                      </option>
                    ))}
                  </select>
                </div>

                <DialogFooter className="pt-2">
                  <DialogClose asChild>
                    <button type="button" className="mr-2 px-4 py-2 rounded-md border">Cancel</button>
                  </DialogClose>
                  <button type="submit" disabled={creating} className="px-4 py-2 rounded-md bg-zinc-900 text-white disabled:opacity-60">
                    {creating ? "Creating..." : "Create"}
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <DeviceList devices={devices} onEdit={handleEdit} onDelete={handleDelete} />

      {/* Edit Device Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Device</DialogTitle>
            <DialogDescription>Update device name and room.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <Label>Device Name</Label>
              <Input 
                value={editForm.name} 
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} 
                placeholder="Device name" 
              />
            </div>
            <div>
              <Label>Type</Label>
              <select
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={editForm.type_id || ""}
                onChange={(e) => setEditForm((f) => ({ ...f, type_id: parseInt(e.target.value) }))}
              >
                <option value="">Select a type</option>
                {types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Room</Label>
              <select 
                className="mt-1 w-full rounded-md border px-3 py-2" 
                value={editForm.room_id} 
                onChange={(e) => setEditForm((f) => ({ ...f, room_id: e.target.value }))}
              >
                <option value="">Select a room</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id.toString()}>
                    {room.name}
                  </option>
                ))}
              </select>
            </div>

            <DialogFooter className="pt-2">
              <DialogClose asChild>
                <button type="button" className="mr-2 px-4 py-2 rounded-md border">Cancel</button>
              </DialogClose>
              <button type="submit" className="px-4 py-2 rounded-md bg-zinc-900 text-white">Update</button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="text-sm text-zinc-500">Total: {devices.length} devices</div>
    </div>
  );
}
