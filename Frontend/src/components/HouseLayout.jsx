import RoomCard from "./RoomCard";

export default function HouseLayout({ rooms = [] }) {
  return (
    <div className="flex-1 bg-zinc-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-800 mb-2">House Layout</h1>
        <p className="text-zinc-600">Overview of all rooms and devices</p>
      </div>

      {/* Room grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Toont alleen rooms die de parent als zichtbaar doorgeeft. */}
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            id={room.id}
            name={room.name}
            deviceCount={room.deviceCount}
            activeDevices={room.activeDevices}
            devices={room.devices || []}
          />
        ))}
      </div>
    </div>
  );
}
