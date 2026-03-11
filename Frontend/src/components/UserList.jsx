import React from "react";
import { Button } from "@/components/shadcn/button";

// Normaliseert role-string zodat de select altijd consistente waardes gebruikt.
function normalizeRole(role) {
  const value = String(role ?? "user").trim().toLowerCase();
  return value === "admin" ? "admin" : "user";
}

export default function UserList({
  users = [],
  onRoleChange,
  onRemove,
  onChangePassword,
  showActions = true,
  deletingId = null,
  updatingRoleId = null,
  changingPasswordId = null,
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-900">
      <table className="min-w-full table-fixed">
        {/* Lijst gebruikt controlled role-selects voor inline role updates. */}
        <thead>
          <tr className="bg-white">
            <th className="px-6 py-3 text-left">Name</th>
            <th className="px-6 py-3 text-left">Email</th>
            <th className="px-6 py-3 text-left">Role</th>
            <th className="px-6 py-3 text-left">Status</th>
            {showActions && <th className="px-6 py-3 text-left">Actions</th>}
          </tr>
        </thead>

        <tbody>
          {users.map((u) => {
            const roleValue = normalizeRole(u.role);

            return (
              <tr key={u.id} className="border-t">
                <td className="px-6 py-4">{u.name}</td>
                <td className="px-6 py-4">{u.email}</td>

                <td className="px-6 py-4">
                  {/* Role-switch triggert direct de update callback uit de parent. */}
                  <select
                    value={roleValue}
                    onChange={(e) => onRoleChange?.(u.id, e.target.value)}
                    disabled={updatingRoleId === u.id}
                    className="rounded-md border border-zinc-300 px-3 py-1 text-sm disabled:opacity-60"
                  >
                    {/* value lowercase (backend), label uppercase (UI) */}
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                </td>

                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-2 rounded-full border border-green-400 px-3 py-1 text-xs font-medium text-green-700">
                    {u.status}
                  </span>
                </td>

                {showActions && (
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onChangePassword?.(u)}
                        disabled={changingPasswordId === u.id}
                      >
                        {changingPasswordId === u.id ? "Saving..." : "Change password"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onRemove?.(u.id)}
                        disabled={deletingId === u.id}
                      >
                        {deletingId === u.id ? "Removing..." : "Remove"}
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}

          {users.length === 0 && (
            <tr>
              <td
                colSpan={showActions ? 5 : 4}
                className="px-6 py-8 text-center text-sm text-zinc-500"
              >
                Geen gebruikers gevonden
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
