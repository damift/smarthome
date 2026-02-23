import React from "react";
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

const sampleDevices = [
  { id: 1, name: "Main Ceiling Light", type: "LIGHT", room: "Living Room", status: "ON", icon: "💡" },
  { id: 2, name: "Corner Lamp", type: "LIGHT", room: "Living Room", status: "OFF", icon: "💡" },
  { id: 3, name: "Living Room Thermostat", type: "THERMOSTAT", room: "Living Room", status: "ON", icon: "🌡️" },
  { id: 4, name: "Security Camera", type: "CAMERA", room: "Living Room", status: "ON", icon: "📷" },
];

export default function DeviceConfigPage() {
  const [devices, setDevices] = React.useState(sampleDevices);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", type: "LIGHT", room: "Living Room", status: "OFF" });

  function handleDelete(id) {
    if (!confirm("Delete device?")) return;
    setDevices((d) => d.filter((x) => x.id !== id));
  }

  function handleEdit(id) {
    // placeholder: navigate to edit page or open edit dialog
    alert(`Edit device ${id}`);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const next = devices.length + 1;
    setDevices((d) => [...d, { id: 100 + next, name: form.name || `Device ${next}`, type: form.type, room: form.room, status: form.status }]);
    setForm({ name: "", type: "LIGHT", room: "Living Room", status: "OFF" });
    setOpen(false);
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
                    <option>LOCK</option>
                    <option>SENSOR</option>
                  </select>
                </div>
                <div>
                  <Label>Room</Label>
                  <Input value={form.room} onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))} placeholder="Living Room" />
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

      <DeviceList devices={devices} onEdit={handleEdit} onDelete={handleDelete} />

      <div className="text-sm text-zinc-500">Total: {devices.length} devices</div>
    </div>
  );
}
