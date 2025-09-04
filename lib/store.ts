import { promises as fs } from "fs";
import path from "path";

const ROOT = process.cwd();

export async function readLocalStore() {
  const playersPath = path.join(ROOT, "data", "players.public.json");
  const statePath   = path.join(ROOT, "data", "draft-state.json");
  const [playersRaw, stateRaw] = await Promise.all([
    fs.readFile(playersPath, "utf-8"),
    fs.readFile(statePath, "utf-8"),
  ]);
  const players = JSON.parse(playersRaw);
  const state   = JSON.parse(stateRaw);
  return { players, state };
}
