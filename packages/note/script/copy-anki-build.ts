import { cp, stat } from "node:fs/promises";
import { basename, join } from "node:path";
import { env } from "../tools/env.ts";
import { paths } from "../tools/paths.ts";

class Script {
  async ensureAnkiDir() {
    await stat(env.ANKI_COLLECTION_MEDIA_PATH);
  }

  async copyAssetsFromDistToAnkiBuild() {
    const ASSETS = [
      [paths["@/dist/_hakuchou.js"], paths["@/.anki-build/_hakuchou.js"]],
      [paths["@/dist/_hakuchou_libs.js"], paths["@/.anki-build/_hakuchou_libs.js"]],
      [paths["@/dist/_hakuchou.css"], paths["@/.anki-build/_hakuchou.css"]],
    ] as const;

    console.log("\n📁 Copying assets from dist to .anki-build...");
    for (const [src, dest] of ASSETS) {
      await cp(src, dest);
      console.log(`✅ Copied ${basename(src)} to .anki-build`);
    }
  }

  async copyFiles(files: string[], srcDir: string) {
    for (const file of files) {
      const src = join(srcDir, file);
      await stat(src);
      const dest = join(env.ANKI_COLLECTION_MEDIA_PATH, file);
      await cp(src, dest);
      console.log(`✅ Copied ${basename(src)}`);
    }
  }

  async copyAnkiBuild() {
    const FILES = [
      paths["@/.anki-build/_hakuchou.css"],
      paths["@/.anki-build/_hakuchou.js"],
      paths["@/.anki-build/_hakuchou_libs.js"],
    ].map((p) => basename(p));

    console.log("\n📁 Copying ANKI BUILD files...");
    await this.copyFiles(FILES, paths["@/.anki-build/"]);
  }

  async run() {
    console.log(`🔍 Checking Anki collection at: ${env.ANKI_COLLECTION_MEDIA_PATH}`);
    await this.ensureAnkiDir();
    await this.copyAssetsFromDistToAnkiBuild();
    await this.copyAnkiBuild();
    console.log("\n🎉 Done!");
  }
}

const script = new Script();
script.run();
