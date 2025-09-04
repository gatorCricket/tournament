"use client";
import { useEffect, useMemo, useState } from "react";

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

export default function TeamsPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [state, setState] = useState<DraftState | null>(null);

const load = async () => {
  const { players: p, state: s } = await fetch("/api/store", { cache: "no-store" }).then(r => r.json());
  setPlayers(p); setState(s);
};

  useEffect(() => {
    load();
    const t = setInterval(load, 1500); // light polling
    return () => clearInterval(t);
  }, []);

  const rosters = useMemo(() => {
    if (!state) return {};
    const map: Record<string, Player[]> = {};
    state.teams.forEach(t => (map[t.id] = []));

    const byId = Object.fromEntries(players.map(p => [p.id, p]));
    const byName = Object.fromEntries(
      players.map(p => [p.displayName.trim().toLowerCase(), p])
    );

    [...(state.picks || [])]
      .sort((a, b) => a.pickNo - b.pickNo)
      .forEach(pick => {
        const key = String(pick.playerId).trim();
        const pl = byId[key] || byName[key.toLowerCase()];
        if (pl && map[pick.teamId]) map[pick.teamId].push(pl);
      });

    return map;
  }, [state, players]);

  if (!state) return <main className="p-4">Loading…</main>;

  return (
    <main className="max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-semibold">Team Rosters</h1>
        <div className="text-sm opacity-80">
          Round {state.round} • On the clock: <b>{state.onClockTeamId || "-"}</b>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {state.teams.map(team => {
          const list = (rosters as any)[team.id] as Player[] | undefined;
          return (
            <div key={team.id} className="border rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-medium">{team.name}</h2>
                <span className="text-sm opacity-70">{list?.length || 0} players</span>
              </div>

              {(!list || list.length === 0) ? (
                <div className="text-sm opacity-60">No picks yet</div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {list.map(p => (
                    <div key={p.id} className="border rounded-lg p-2">
                      {p.photoUrl && (
                        <img
                          src={toDriveView(p.photoUrl)}
                          alt={p.displayName}
                          className="w-full h-28 object-cover rounded-md"
                        />
                      )}
                      <div className="mt-1 text-sm font-medium">{p.displayName}</div>
                      <div className="text-xs">Bat {p.batRating ?? "-"} • Bowl {p.bowlRating ?? "-"}</div>
                      {p.duoName && <div className="text-xs mt-1 opacity-80">Duo: {p.duoName}</div>}
                      {p.cricClubsId && <div className="text-xs opacity-80">CricClubs: {p.cricClubsId}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
