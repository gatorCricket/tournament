import { NextResponse } from "next/server";
import { readLocalStore } from "@/lib/store";

// Ensure this never gets statically optimized
export const dynamic = "force-dynamic";

type Team = { id: string; name: string };
type Pick = { pickNo: number; teamId: string; playerId: string; ts?: string };
type Player = {
  id: string; displayName: string; photoUrl?: string;
  batRating?: number; bowlRating?: number; rolePreference?: string;
  notesForCaptains?: string; clubs?: string[]; duoName?: string; duoOptIn?: string; cricClubsId?: string;
};
type DraftState = { id: string; status: string; round: number; onClockTeamId?: string; teams: Team[]; picks: Pick[] };

export async function GET() {
  try {
    const { players, state } = await readLocalStore();
    return NextResponse.json({ players: players as Player[], state: state as DraftState });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    // Return a JSON error so the browser shows details (instead of generic "Failed to fetch")
    return NextResponse.json(
      { error: message, hint: "Check that /data/players.public.json and /data/draft-state.json exist at project root." },
      { status: 500 }
    );
  }
}
