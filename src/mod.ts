import { compare, maxSatisfying, valid } from "semver";
import { readdir, readFile, stat } from "fs/promises";
import { join, resolve } from "path";
import { marked } from "marked";
import { modsDir } from "./utils";
import formatSize from "filesize";
import { config } from "./config";

type ModMetadata = {
  id: string;
  name: string;
  description: string;
  screenshots: string[];
  readmeHTML?: string;
  versions: ModVersion[];
};

export class ModVersion {
  path: string;

  constructor(
    private modName: string,
    public number: string,
    public fileSize: number,
    public released: Date
  ) {
    if (!valid(number)) {
      throw new Error("Invalid version: " + number);
    }

    this.path = resolve(modsDir, modName, number + ".js");
  }

  get formattedSize() {
    return formatSize(this.fileSize);
  }

  get downloadURL() {
    const endpoint = `/api/download/${this.modName}/${this.number}`;
    return new URL(endpoint, config!.publicHost);
  }

  get installURL() {
    const endpoint = `/api/manifest/${this.modName}/${this.number}`;
    return new URL(endpoint, config!.publicHost.replace("https", "shapeziomm"));
  }

  toString() {
    return `v${this.number}`;
  }

  toJSON() {
    return {
      version: this.number,
      rawFileSize: this.fileSize,
      fileSize: this.formattedSize,
      released: this.released
    };
  }
}

export class Mod {
  id: string;
  name: string;
  description: string;
  screenshots: string[];
  readmeHTML?: string;
  versions: ModVersion[];

  private constructor(metadata: ModMetadata) {
    this.id = metadata.id;
    this.name = metadata.name;
    this.description = metadata.description;
    this.screenshots = metadata.screenshots;
    this.readmeHTML = metadata.readmeHTML;
    this.versions = [...metadata.versions];

    this.versions.sort(({ number: a }, { number: b }) => compare(b, a));
  }

  static async fromFile(file: string) {
    const name = file.slice(0, -5);

    const metadataPath = join("./mods", file);
    const metadataJSON = await readFile(metadataPath, "utf-8");
    const metadata = JSON.parse(metadataJSON);
    metadata.id = name;
    metadata.versions = [];

    const modFilesPath = join(modsDir, name);
    const modFiles = await readdir(modFilesPath);
    for (const file of modFiles.filter((file) => file.endsWith(".js"))) {
      const filePath = join(modsDir, name, file);
      const version = file.slice(0, -3);
      const { size, mtime } = await stat(filePath);

      metadata.versions.push(new ModVersion(name, version, size, mtime));
    }

    metadata.screenshots = modFiles
      .filter((file) => file.endsWith(".png"))
      .map((file) => resolve(modFilesPath, file));

    const readmePath = metadataPath.replace(/\.json$/, ".md");
    try {
      const readmeText = await readFile(readmePath, "utf-8");
      metadata.readmeHTML = marked(readmeText);
    } catch {}

    return new Mod(metadata as ModMetadata);
  }

  get downloadURL() {
    return this.getBestVersion()?.downloadURL;
  }

  get installURL() {
    return this.getBestVersion()?.installURL;
  }

  get lastUpdated() {
    return this.versions[0]?.released;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      latestVersion: this.versions[0],
      bestVersion: this.getBestVersion()
    };
  }

  getBestVersion(range: string = "*") {
    const allVersions = this.versions.map((v) => v.number);
    const version = maxSatisfying(allVersions, range);
    if (version === null) {
      return undefined;
    }

    return this.versions.find((v) => v.number == version);
  }
}
