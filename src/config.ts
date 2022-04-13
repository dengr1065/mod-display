import { readFile } from "fs/promises";

export let config: Config | null = null;
type Config = {
  listenPort: number;
  listenAddress: string;
  defaultAuthors: string[];
  publicHost: string;
};

export async function readConfig() {
  const text = await readFile("./config.json", "utf-8");
  return (config = JSON.parse(text) as Config);
}
