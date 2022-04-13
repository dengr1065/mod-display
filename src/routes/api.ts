import { ErrorRequestHandler, RequestHandler, Router } from "express";
import { validRange } from "semver";
import { Errors } from "../errors";
import { clampedNumber, useMod } from "../utils";
import { config } from "../config";

const route = Router();

const useRange: RequestHandler = (req, res, next) => {
  req.versionRange = "*";
  if (req.params.range !== undefined) {
    if (!validRange(req.params.range)) {
      res.status(400).send(Errors.INVALID_VERSION);
      return;
    }

    req.versionRange = req.params.range;
  }

  req.bestVersion = req.mod?.getBestVersion(req.versionRange);
  next();
};

route.get("/download/:mod/:range?", useMod, useRange, (req, res) => {
  const modFile = req.bestVersion?.path;
  if (!modFile) {
    res.status(404).send(Errors.NO_MATCHING_VERSION);
    return;
  }

  const filename = JSON.stringify(req.mod!.id + ".mod.js");
  res.set("Content-Disposition", "attachment; filename=" + filename);
  res.sendFile(modFile);
});

route.get("/manifest/:mod/:range?", useMod, useRange, (req, res) => {
  if (!req.bestVersion) {
    res.status(404).send(Errors.NO_MATCHING_VERSION);
    return;
  }

  const endpoint = `/download/${req.mod!.id}/${req.bestVersion.number}`;
  res.send({
    name: req.mod!.name,
    description: req.mod!.description,
    authors: config!.defaultAuthors,
    version: req.bestVersion.number,
    url: new URL(endpoint, config!.publicHost).href
  });
});

route.get("/screenshot/:mod/:index", useMod, (req, res) => {
  const index = clampedNumber(req.params.index);
  if (index == undefined || index < 0 || index >= req.mod!.screenshots.length) {
    res.status(400).send(Errors.INVALID_SCREENSHOT);
    return;
  }

  res.sendFile(req.mod!.screenshots[index]);
});

route.get("/readme/:mod", useMod, (req, res) => {
  if (!req.mod?.readmeHTML) {
    res.status(404).send(Errors.MISSING_README);
    return;
  }

  res.contentType("md");
  res.send(req.mod!.readmeHTML);
});

route.get("/versions/:mod", useMod, (req, res) => {
  const limit = clampedNumber(req.query.limit, 1, 100, 25);
  res.send(req.mod?.versions.slice(0, limit));
});

route.get("/*", (_req, res) => {
  res.status(404).send(Errors.INVALID_ROUTE);
});

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  res.status(500).send(Errors.SERVER_ERROR);
};
route.use(errorHandler);

export default route;
