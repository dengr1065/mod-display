import express from "express";
import { readConfig } from "./config";
import { parseMods } from "./mod_store";
import { apiRoute, webRoute } from "./routes";

const app = express();

app.set("views", "./views");

app.use("/api", apiRoute);
app.use(webRoute);

async function main() {
  const config = await readConfig();
  await parseMods("./mods");

  app.listen(config.listenPort, config.listenAddress);
}

main();
