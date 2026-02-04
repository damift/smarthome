import { Link } from "react-router-dom";
import React from "react";

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-zinc-400">Router test: dit is /dashboard</p>

      <div className=" w-screen flex flex-wrap gap-2">
        <Link className="underline" to="/rooms/1">Go to Room 1</Link>
        <Link className="underline" to="/rooms/2">Go to Room 2</Link>
      </div>
    </div>
  );
}
