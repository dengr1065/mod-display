import { NextFunction, Request, RequestHandler, Response } from "express";
import { Errors } from "./errors";
import { mods } from "./mod_store";

export const modsDir = "./mods";

const useModHandler = (
  optional: boolean,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const mod = mods.find((mod) => mod.id === req.params.mod);
  if (!optional && mod === undefined) {
    res.status(404).send(Errors.NO_SUCH_MOD);
    return;
  }

  req.mod = mod;
  next();
};

export const useMod: RequestHandler = useModHandler.bind(null, false);
export const useOptionalMod: RequestHandler = useModHandler.bind(null, true);

export function clampedNumber(
  source: any,
  min: number = -Infinity,
  max: number = Infinity,
  fallback?: number
) {
  let result = Number(source);
  if (isNaN(result)) {
    return fallback;
  }

  result = Math.max(result, min);
  result = Math.min(result, max);
  return result;
}
