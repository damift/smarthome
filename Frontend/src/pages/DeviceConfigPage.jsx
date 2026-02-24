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

export default function DeviceConfigPage() {
  const [devices, setDevices] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: "", type: "LIGHT", room_id: "", status: "OFF" });

  // Fetch devices and rooms on component mount
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [devicesData, roomsData] = await Promise.all([
        devicesService.getDevices(),
        roomsService.getRooms(),
      ]);
      setDevices(devicesData);
      setRooms(roomsData);
      // Set default room_id if rooms exist
      if (roomsData && roomsData.length > 0) {
        setForm((f) => ({ ...f, room_id: roomsData[0].id.toString() }));
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
    // placeholder: navigate to edit page or open edit dialog
    alert(`Edit device ${id}`);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Validate room_id
    if (!form.room_id) {
      setError("Please select a room");
      return;
    }

    try {
      const newDevice = {
        name: form.name || `Device ${devices.length + 1}`,
        type: form.type,
        room_id: parseInt(form.room_id),
        status: form.status,
      };
      console.log("Creating device with:", newDevice);
      
      const response = await devicesService.createDevice(newDevice);
      console.log("Device created response:", response);
      
      setDevices((d) => [...d, response.device]);
      setForm({ name: "", type: "LIGHT", room_id: rooms.length > 0 ? rooms[0].id.toString() : "", status: "OFF" });
      setOpen(false);
      setError(null);
      toast.success("Device created");
    } catch (err) {
      console.error("Full error object:", err);
      setError(err.message || "Failed to create device");
      toast.error(err.message || "Failed to create device");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-50">
        <p className="text-zinc-600">Loading devices...</p>
      </div>
    );
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
                  <select className="mt-1 w-full rounded-md border px-3 py-2" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                    <option>LIGHT</option>
                    <option>THERMOSTAT</option>
                    <option>CAMERA</option>
                    <option>OUTLET</option>
                    <option>SENSOR</option>
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
                  <button type="submit" className="px-4 py-2 rounded-md bg-zinc-900 text-white">Create</button>
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

      <div className="text-sm text-zinc-500">Total: {devices.length} devices</div>
    </div>
  );
}
