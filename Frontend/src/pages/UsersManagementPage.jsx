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
import { deleteUser as apiDeleteUser } from "@/services/users";
import { getToken } from "@/lib/auth";

export default function UsersManagementPage() {
  const [users, setUsers] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", email: "", role: "user", password: "", password_confirmation: "" });
  const [loading, setLoading] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState(null);

  function handleRoleChange(id, newRole) {
    setUsers((u) => u.map((x) => (x.id === id ? { ...x, role: newRole } : x)));
  }

  async function handleRemove(id) {
    if (!confirm("Verwijder gebruiker?")) return;
    try {
      setDeletingId(id);
      await apiDeleteUser(id);
      setUsers((u) => u.filter((x) => x.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert(`Kon gebruiker niet verwijderen: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  }

  function handleAdd() {
    setOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        password_confirmation: form.password_confirmation,
        role: form.role,
      };
      const res = await fetch("http://localhost:8080/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => res.statusText);
        throw new Error(errText || `${res.status}`);
      }
      // refresh list after successful create
      const created = await res.json().catch(() => null);
      // reload users by calling same loader
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const listRes = await fetch("http://localhost:8080/api/user", { headers });
      const listData = await listRes.json().catch(() => []);
      let list = [];
      if (Array.isArray(listData)) list = listData;
      else if (listData.users) list = listData.users;
      else if (listData.data && Array.isArray(listData.data)) list = listData.data;
      else list = [listData];
      setUsers(list.map((u) => ({ id: u.id ?? u.user_id ?? u.email, name: u.name ?? u.full_name ?? "", email: u.email ?? "", role: (u.role ?? "user"), status: u.status ?? "ACTIVE" })));
      setForm({ name: "", email: "", role: "user", password: "", password_confirmation: "" });
      setOpen(false);
    } catch (err) {
      console.error("Create user failed:", err);
      alert(`Kan gebruiker niet aanmaken: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const token = getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch("http://localhost:8080/api/user", { headers });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = await res.json().catch(() => null);
        // normalize: if array, use it; if object with users/data, extract; if single user object, wrap
        let list = [];
        if (Array.isArray(data)) list = data;
        else if (data == null) list = [];
        else if (data.users) list = data.users;
        else if (data.data && Array.isArray(data.data)) list = data.data;
        else list = [data];
        setUsers(list.map((u) => ({ id: u.id ?? u.user_id ?? u.email, name: u.name ?? u.full_name ?? "", email: u.email ?? "", role: (u.role ?? "user"), status: u.status ?? "ACTIVE" })));
      } catch (err) {
        console.error("Failed to load users:", err);
        // keep users empty
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

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
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                </div>

                <div>
                  <Label>Password</Label>
                  <Input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Choose a password" />
                </div>

                <div>
                  <Label>Confirm Password</Label>
                  <Input type="password" value={form.password_confirmation} onChange={(e) => setForm((f) => ({ ...f, password_confirmation: e.target.value }))} placeholder="Confirm password" />
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

      <UserList users={users} onRoleChange={handleRoleChange} onRemove={handleRemove} showActions={true} deletingId={deletingId} />

      <div className="text-sm text-zinc-500">Total: {users.length} users</div>
    </div>
  );
}
