"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Player = { id: string; displayName: string };
type DraftState = {
  teams: { id: string; name: string }[];
  picks: { playerId: string }[];
  round: number;
  status: string;
  onClockTeamId?: string;
};

const BLUE = "#0021A5";   // Gator Blue
const ORANGE = "#FA4616"; // Gator Orange

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [state, setState] = useState<DraftState | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/store", { cache: "no-store" });
      const { players, state } = await res.json();
      setPlayers(players);
      setState(state);
    };
    load();
    const t = setInterval(load, 2000);
    return () => clearInterval(t);
  }, []);

  const counts = useMemo(() => {
    if (!state) return { totalPlayers: 0, available: 0, teams: 0 };
    const pickedIds = new Set(state.picks?.map((p) => p.playerId));
    const pickedNames = new Set(
      state.picks?.map((p) => String(p.playerId).trim().toLowerCase())
    );
    const available = players.filter(
      (pl) =>
        !pickedIds.has(pl.id) &&
        !pickedNames.has(pl.displayName.trim().toLowerCase())
    ).length;
    return { totalPlayers: players.length, available, teams: state.teams?.length || 0 };
  }, [players, state]);

  return (
    <main className="min-h-screen bg-[#0b0d12]">
      {/* Top banner */}
      <header
        className="w-full"
        style={{
          background: `linear-gradient(135deg, ${BLUE} 0%, ${ORANGE} 100%)`,
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-sm">
            Gator Cricket — Community Draft
          </h1>
          <p className="mt-2 text-white/90">
            Follow the draft live. Browse available players and check team rosters.
          </p>

          {/* CTAs */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href="/draft/players"
              className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-lg font-semibold text-white shadow-md"
              style={{ backgroundColor: ORANGE }}
            >
              View Available Players
            </Link>
            <Link
              href="/draft/teams"
              className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-lg font-semibold text-white shadow-md"
              style={{ backgroundColor: BLUE }}
            >
              View Team Rosters
            </Link>
          </div>
        </div>
      </header>

      {/* Stats strip */}
      <section className="max-w-6xl mx-auto px-6 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Status" value={state?.status ?? "—"} color={BLUE} />
          <StatCard label="Round" value={state?.round ?? "—"} color={BLUE} />
          <StatCard label="Teams" value={counts.teams} color={ORANGE} />
          <StatCard
            label="Players (avail / total)"
            value={`${counts.available} / ${counts.totalPlayers}`}
            color={ORANGE}
          />
        </div>
      </section>

      {/* Info blocks */}
      <section className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-5">
        <InfoCard title="Format">
          Snake/serpentine draft. 4 players per team (adjustable). Captains pick in
          order; optional pick clock.
        </InfoCard>
        <InfoCard title="Eligibility">
          Open community draft. Captains consider ratings, role preference, notes, and
          team balance.
        </InfoCard>
        <InfoCard title="Contact">
          For issues during the draft, reach the organizer on site or via Zoom chat.
        </InfoCard>
      </section>
    </main>
  );
}

function StatCard({ label, value, color }: { label: string; value: any; color: string }) {
  return (
    <div className="rounded-2xl p-4 shadow-sm border" style={{ borderColor: `${color}40`, background: "#12151d" }}>
      <div className="text-sm" style={{ color }}>
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-white">{String(value)}</div>
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5 border shadow-sm bg-[#12151d]">
      <h2 className="font-semibold text-white">{title}</h2>
      <p className="text-sm mt-2 text-white/80">{children}</p>
    </div>
  );
}
