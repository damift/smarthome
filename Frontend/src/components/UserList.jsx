import React from "react";
import { Button } from "@/components/shadcn/button";

export default function UserList({ users = [], onRoleChange, onRemove, showActions = true }) {
  return (
    <div className="overflow-x-auto border border-zinc-900 rounded-lg">
      <table className="min-w-full table-fixed">
        <thead>
          <tr className="bg-white">
            <th className="text-left px-6 py-3">Name</th>
            <th className="text-left px-6 py-3">Email</th>
            <th className="text-left px-6 py-3">Role</th>
            <th className="text-left px-6 py-3">Status</th>
            {showActions && <th className="text-left px-6 py-3">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="px-6 py-4">{u.name}</td>
              <td className="px-6 py-4">{u.email}</td>
              <td className="px-6 py-4">
                <select
                  value={u.role}
                  onChange={(e) => onRoleChange?.(u.id, e.target.value)}
                  className="rounded-md border border-zinc-300 px-3 py-1 text-sm"
                >
                  <option>Admin</option>
                  <option>User</option>
                  <option>Visitor</option>
                </select>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-400 text-green-700 text-xs font-medium">{u.status}</span>
              </td>
              {showActions && (
                <td className="px-6 py-4">
                  <Button variant="destructive" size="sm" onClick={() => onRemove?.(u.id)}>Remove</Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
