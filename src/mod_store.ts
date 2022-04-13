import { readdir } from "fs/promises";
import { Mod } from "./mod";

export const mods: Mod[] = [];

export async function parseMods(dir: string) {
  const files = await readdir(dir);
  for (const file of files) {
    if (!file.endsWith(".json")) {
      continue;
    }

    mods.push(await Mod.fromFile(file));
  }
}
