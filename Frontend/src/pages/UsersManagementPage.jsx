import React from "react";
import { Button } from "@/components/shadcn/button";
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
import UserList from "@/components/UserList";

const initialUsers = [
  { id: 1, name: "Admin User", email: "admin@smart.home", role: "Admin", status: "ACTIVE" },
  { id: 2, name: "Regular User", email: "user@smart.home", role: "User", status: "ACTIVE" },
  { id: 3, name: "Guest Visitor", email: "visitor@smart.home", role: "Visitor", status: "ACTIVE" },
];

export default function UsersManagementPage() {
  const [users, setUsers] = React.useState(initialUsers);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", email: "", role: "User" });

  function handleRoleChange(id, newRole) {
    setUsers((u) => u.map((x) => (x.id === id ? { ...x, role: newRole } : x)));
  }

  function handleRemove(id) {
    if (!confirm("Verwijder gebruiker?")) return;
    setUsers((u) => u.filter((x) => x.id !== id));
  }

  function handleAdd() {
    setOpen(true);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const next = users.length + 1;
    setUsers((u) => [
      ...u,
      { id: 100 + next, name: form.name || `New User ${next}`, email: form.email || `new${next}@smart.home`, role: form.role || "User", status: "ACTIVE" },
    ]);
    setForm({ name: "", email: "", role: "User" });
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">User Management</h1>
          <p className="text-zinc-400">Manage users and their permissions</p>
        </div>

        <div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="default">➕ Add User</Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add User</DialogTitle>
                <DialogDescription>Fill in user details to create a new account.</DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Full name" />
                </div>

                <div>
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="email@example.com" />
                </div>

                <div>
                  <Label>Role</Label>
                  <select className="mt-1 w-full rounded-md border px-3 py-2" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
                    <option>Admin</option>
                    <option>User</option>
                    <option>Visitor</option>
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

      <UserList users={users} onRoleChange={handleRoleChange} onRemove={handleRemove} showActions={true} />

      <div className="text-sm text-zinc-500">Total: {users.length} users</div>
    </div>
  );
}
