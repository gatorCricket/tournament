"use client";
import { useEffect, useMemo, useState } from "react";

type Team = { id: string; name: string };
type Pick = { pickNo: number; teamId: string; playerId: string; ts?: string };
type Player = {
  id: string; displayName: string; photoUrl?: string;
  batRating?: number; bowlRating?: number; rolePreference?: string;
  notesForCaptains?: string; clubs?: string[]; duoName?: string; duoOptIn?: string; cricClubsId?: string;
};
type DraftState = { id: string; status: string; round: number; onClockTeamId?: string; teams: Team[]; picks: Pick[] };

export default function TeamsPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [state, setState] = useState<DraftState | null>(null);

  const load = async () => {
    const res = await fetch("/api/store", { cache: "no-store" });
    const data: { players: Player[]; state: DraftState } = await res.json();
    setPlayers(data.players);
    setState(data.state);
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 1500);
    return () => clearInterval(t);
  }, []);

  const rosters = useMemo(() => {
    if (!state) return {} as Record<string, Player[]>;
    const map: Record<string, Player[]> = {};
    state.teams.forEach((t) => (map[t.id] = []));
    const byId = Object.fromEntries(players.map((p) => [p.id, p]));
    const byName = Object.fromEntries(players.map((p) => [p.displayName.trim().toLowerCase(), p]));
    [...(state.picks ?? [])]
      .sort((a, b) => a.pickNo - b.pickNo)
      .forEach((pick) => {
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
        {state.teams.map((team) => {
          const list = rosters[team.id] ?? [];
          return (
            <div key={team.id} className="border rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-medium">{team.name}</h2>
                <span className="text-sm opacity-70">{list.length} players</span>
              </div>

              {list.length === 0 ? (
                <div className="text-sm opacity-60">No picks yet</div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {list.map((p) => (
                    <div key={p.id} className="border rounded-lg p-2">
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
