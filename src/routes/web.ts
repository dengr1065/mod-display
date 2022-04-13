import { default as express, Router } from "express";
import { mods } from "../mod_store";
import { useOptionalMod } from "../utils";

const route = Router();

route.use("/assets", express.static("assets"));

route.get("/view/:mod", useOptionalMod, (req, res, next) => {
  if (req.mod === undefined) {
    next();
    return;
  }

  res.locals.mod = req.mod;
  res.locals.bestVersion = req.mod.getBestVersion();
  res.locals.target = "viewMod sidebar";
  res.render("view_mod.pug");
});

route.get("/", (req, res) => {
  let sortMethod = "new";
  if (req.query.sort == "alpha") {
    sortMethod = "alpha";
  }

  res.locals.mods = [...mods].sort((a, b) => {
    if (sortMethod == "new") {
      if (!a.lastUpdated && b.lastUpdated) {
        return 1;
      }

      if (a.lastUpdated && !b.lastUpdated) {
        return -1;
      }

      const result = b.lastUpdated.getTime() - a.lastUpdated.getTime();
      return isNaN(result) ? 0 : result;
    }

    if (a.name < b.name) {
      return -1;
    }

    return a.name > b.name ? 1 : 0;
  });

  res.locals.sortMethod = sortMethod;
  res.render("main_page.pug");
});

route.get("/*", (_req, res) => {
  res.status(404);
  res.render("not_found.pug");
});

export default route;
