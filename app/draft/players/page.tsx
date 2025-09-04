"use client";
import { useEffect, useState } from "react";

type Player = {
  id: string;
  displayName: string;
  photoUrl?: string;
  batRating?: number;
  bowlRating?: number;
  rolePreference?: string;
  notesForCaptains?: string;
  clubs?: string[];
  duoName?: string;
  duoOptIn?: string;
  cricClubsId?: string;
};

type DraftState = {
  id: string;
  status: string;
  round: number;
  onClockTeamId?: string;
  teams: { id: string; name: string }[];
  picks: { pickNo: number; teamId: string; playerId: string; ts?: string }[];
};

const toDriveView = (url?: string) => {
  if (!url) return "";
  const m = url.match(/(?:id=|file\/d\/)([\w-]+)/);
  return m ? `https://drive.google.com/uc?export=view&id=${m[1]}` : url;
};

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    const load = async () => {
      const [ps, st] = await Promise.all([
        fetch("/data/players.public.json", { cache: "no-store" }).then(r => r.json()),
        fetch("/data/draft-state.json", { cache: "no-store" }).then(r => r.json()),
      ]);
      const pickedNames = new Set(
        (st?.picks || []).map((p: any) => String(p.playerId).trim().toLowerCase())
      );
      const available = (ps as Player[]).filter(
        p => !pickedNames.has(String(p.displayName).trim().toLowerCase())
      );
      setPlayers(available);
    };
    load();
    const t = setInterval(load, 1500);
    return () => clearInterval(t);
  }, []);

  const filtered = players.filter(p =>
    p.displayName.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <main className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Available Players</h1>

      <input
        placeholder="Search by name…"
        className="border rounded-md p-2 w-full mb-4"
        value={q}
        onChange={e => setQ(e.target.value)}
      />

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map(p => (
          <div key={p.id} className="border rounded-xl p-3">
            {p.photoUrl && (
              <img
                src={toDriveView(p.photoUrl)}
                alt={p.displayName}
                className="w-full h-40 object-cover rounded-lg"
              />
            )}
            <div className="mt-2 font-medium">{p.displayName}</div>
            <div className="text-sm">
              Bat: {p.batRating ?? "-"} • Bowl: {p.bowlRating ?? "-"}
            </div>
            {p.rolePreference && (
              <div className="text-xs mt-1">Role: {p.rolePreference}</div>
            )}
            {(p.duoName || p.cricClubsId) && (
              <div className="text-xs mt-1 opacity-80">
                {p.duoName && <>Duo: {p.duoName}<br/></>}
                {p.cricClubsId && <>CricClubs: {p.cricClubsId}</>}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
