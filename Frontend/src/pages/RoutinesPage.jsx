import React from "react";
import RoutineCard from "@/components/RoutineCard";

export default function RoutinesPage() {
  const routines = [
    {
      id: 1,
      title: "Workday",
      description: "Optimize for a productive workday",
      changes: [
        "Living Room: Main Ceiling Light → ON (80%)",
        "Living Room: Thermostat → 22°C",
        "Kitchen: All Lights → ON",
        "Entrance: Lock → LOCKED",
      ],
      icon: "☀️",
    },
    {
      id: 2,
      title: "Evening",
      description: "Relax and wind down",
      changes: [
        "Living Room: Main Ceiling Light → ON (40%)",
        "Living Room: Corner Lamp → ON (50%)",
        "Living Room: Thermostat → 21°C",
        "Bedroom: Dim Lights → 20%",
        "Hall: Motion Sensors → OFF",
      ],
      icon: "🌙",
    },
    {
      id: 3,
      title: "Night",
      description: "Secure the house for sleep",
      changes: [
        "All Lights → OFF",
        "All Cameras → ON",
        "All Locks → LOCKED",
        "Thermostat → 18°C",
      ],
      icon: "🌑",
    },
    {
      id: 4,
      title: "Vacation",
      description: "Secure home while away",
      changes: [
        "All Lights → OFF",
        "All Cameras → ON",
        "All Locks → LOCKED",
        "Presence Simulation → ON",
        "Alarm → ARMED",
      ],
      icon: "✈️",
    },
  ];

  function handleActivate(routine) {
    // placeholder: wire to API / real action later
    alert(`Activated ${routine.title}`);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Routines</h1>
      <p className="text-zinc-400">Activate pre-configured device routines</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {routines.map((r) => (
          <RoutineCard
            key={r.id}
            title={r.title}
            description={r.description}
            changes={r.changes}
            icon={<span className="text-2xl">{r.icon}</span>}
            onActivate={() => handleActivate(r)}
          />
        ))}
      </div>
    </div>
  );
}
