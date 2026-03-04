import React from "react";

export default function HistoryFilters({
  search = "",
  setSearch = () => {},
  users = [],
  user = "",
  setUser = () => {},
  rooms = [],
  room = "",
  setRoom = () => {},
} = {}) {
  return (
    <div className="border p-4 rounded-md bg-white">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2 font-medium">Filters</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search/user/room worden als controlled filter state van de parent gebruikt. */}
        <div>
          <label className="text-xs text-zinc-600">SEARCH</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search logs..."
            className="mt-1 w-full rounded-md border px-3 py-2 bg-zinc-50"
          />
        </div>

        <div>
          <label className="text-xs text-zinc-600">USER</label>
          <select value={user} onChange={(e) => setUser(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2 bg-zinc-50">
            <option value="">All Users</option>
            {users.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-zinc-600">ROOM</label>
          <select value={room} onChange={(e) => setRoom(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2 bg-zinc-50">
            <option value="">All Rooms</option>
            {rooms.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
