"use client";
import { useEffect, useState } from "react";

type Player = {
  id: string;
  displayName: string;
  photoUrl?: string;
  batRating?: number;
  bowlRating?: number;
  rolePreference?: string;
  clubs?: string[];
};

const toDriveView = (url?: string) => {
  // turns https://drive.google.com/open?id=FILE_ID into an <img>-friendly link
  if (!url) return "";
  const m = url.match(/(?:id=|file\/d\/)([\w-]+)/);
  return m ? `https://drive.google.com/uc?export=view&id=${m[1]}` : url;
};

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  useEffect(() => {
    const load = async () => {
      const r = await fetch("/data/players.public.json", { cache: "no-store" });
      setPlayers(await r.json());
    };
    load();
    const t = setInterval(load, 1500);   // light polling for “live-ish” updates
    return () => clearInterval(t);
  }, []);

  return (
    <main className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Available Players</h1>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {players.map(p => (
          <div key={p.id} className="border rounded-xl p-3">
          {p.photoUrl && (
            <img
              src={toDriveView(p.photoUrl)}
              alt={p.displayName}
              className="w-full h-40 object-cover rounded-lg"
            />
          )}

            <div className="mt-2 font-medium">{p.displayName}</div>
            <div className="text-sm">Bat: {p.batRating ?? "-"} • Bowl: {p.bowlRating ?? "-"}</div>
            {p.rolePreference && <div className="text-sm">{p.rolePreference}</div>}
          </div>
        ))}
      </div>
    </main>
  );
}
