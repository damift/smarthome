import React from "react";
import { Button } from "@/components/shadcn/button";
import ChangePasswordDialog from "./ChangePasswordDialog";

function normalizeRole(role) {
  const value = String(role ?? "user").trim().toLowerCase();
  return value === "admin" ? "admin" : "user";
}

export default function UserList({
  users = [],
  onRoleChange,
  onRemove,
  showActions = true,
  deletingId = null,
  updatingRoleId = null,
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-900">
      <table className="min-w-full table-fixed">
        <thead>
          <tr className="bg-white">
            <th className="px-6 py-3 text-left">Name</th>
            <th className="px-6 py-3 text-left">Email</th>
            <th className="px-6 py-3 text-left">Role</th>
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

                {showActions && (
                  <td className="px-6 py-4 space-x-2 flex">
                    <ChangePasswordDialog
                      userId={u.id}
                      userName={u.name}
                      onPasswordChanged={() => {
                        // Refresh user list if needed
                      }}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onRemove?.(u.id)}
                      disabled={deletingId === u.id}
                    >
                      {deletingId === u.id ? "Removing..." : "Remove"}
                    </Button>
                  </td>
                )}
              </tr>
            );
          })}

          {users.length === 0 && (
            <tr>
              <td
                colSpan={showActions ? 4 : 3}
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