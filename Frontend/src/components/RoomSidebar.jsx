import { Link } from "react-router-dom";

export default function RoomSidebar({ rooms = [], selectedRoom }) {
  return (
    <aside className="w-64 bg-white border-r border-zinc-200">
      {/* Header */}
      <div className="p-6 border-b border-zinc-200">
        <h2 className="text-lg font-semibold text-zinc-800">Rooms</h2>
      </div>

      {/* Room list */}
      <nav className="p-4 space-y-2">
        {rooms.map((room) => (
          <Link
            key={room.id}
            to={`/rooms/${room.id}`}
            className={`block w-full text-left px-4 py-3 rounded-lg transition-colors ${
              selectedRoom === room.id
                ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                : "text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{room.name}</span>
              <span className="text-sm text-zinc-500 bg-zinc-100 px-2 py-1 rounded">
                ({room.deviceCount})
              </span>
            </div>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
