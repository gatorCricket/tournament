import { NextResponse } from "next/server";
import { readLocalStore } from "@/lib/store";

export async function GET() {
  try {
    const { players, state } = await readLocalStore();
    return NextResponse.json({ players, state });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "read failed" }, { status: 500 });
  }
}
