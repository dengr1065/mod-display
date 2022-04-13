declare namespace Express {
  export interface Request {
    mod?: import("../../src/mod").Mod;
    versionRange?: string;
    bestVersion?: import("../../src/mod").ModVersion;
  }
}
