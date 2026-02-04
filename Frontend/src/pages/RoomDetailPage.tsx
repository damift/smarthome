import { useParams, Link } from "react-router-dom";

export default function RoomDetailPage() {
  const { roomId } = useParams();

  return (
    <div className=" w-screen space-y-4">
      <h1 className="text-2xl font-semibold">Room Detail</h1>
      <p className="text-zinc-400">Router test: dit is /rooms/{roomId}</p>

      <Link className="underline" to="/dashboard">Back to Dashboard</Link>
    </div>
  );
}
