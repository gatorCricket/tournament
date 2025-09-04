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

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    const load = async () => {
      const { players: ps, state: st } = await fetch("/api/store", {
        cache: "no-store",
      }).then((r) => r.json());

      const pickedIds = new Set<string>(
        (st?.picks || []).map((p: any) => String(p.playerId))
      );
      const pickedNames = new Set<string>(
        (st?.picks || []).map((p: any) =>
          String(p.playerId).trim().toLowerCase()
        )
      );
      const available: Player[] = (ps as Player[]).filter(
        (p) =>
          !pickedIds.has(p.id) &&
          !pickedNames.has(p.displayName.trim().toLowerCase())
      );

      setPlayers(available);
    };
    load();
    const t = setInterval(load, 1500);
    return () => clearInterval(t);
  }, []);

  const filtered = players.filter((p) =>
    p.displayName.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <main className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Available Players</h1>

      <input
        placeholder="Search by name…"
        className="border rounded-md p-2 w-full mb-4"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((p) => (
          <div key={p.id} className="border rounded-xl p-3">
            <div className="font-medium text-lg">{p.displayName}</div>
            <div className="text-sm">
              Bat: {p.batRating ?? "-"} • Bowl: {p.bowlRating ?? "-"}
            </div>
            {p.rolePreference && (
              <div className="text-xs mt-1 opacity-80">
                Role: {p.rolePreference}
              </div>
            )}

            {p.notesForCaptains && (
              <div className="text-xs mt-2 p-2 rounded-md border bg-black/5">
                <span className="font-medium">Notes: </span>
                {p.notesForCaptains}
              </div>
            )}

            {(p.duoName || p.cricClubsId) && (
              <div className="text-xs mt-2 opacity-80">
                {p.duoName && <>Duo: {p.duoName}<br /></>}
                {p.cricClubsId && <>CricClubs: {p.cricClubsId}</>}
              </div>
            )}

            {/* Photo action */}
            <div className="mt-3">
              {p.photoUrl ? (
                <a
                  href={p.photoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full rounded-md px-3 py-2 text-sm font-medium border hover:bg-gray-50"
                  title="Open full photo in a new tab"
                >
                  📷 View Photo
                </a>
              ) : (
                <span className="inline-flex items-center justify-center w-full rounded-md px-3 py-2 text-sm font-medium border opacity-60">
                  📷 No Photo
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
