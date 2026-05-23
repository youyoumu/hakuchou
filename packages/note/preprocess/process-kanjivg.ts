import { spawn } from "node:child_process";
import { link, mkdir, readdir, rm, stat } from "node:fs/promises";
import { basename, join } from "node:path";
import { paths } from "../tools/paths.ts";

class Script {
  KANJIVG_DIR = join(paths["@/"], ".kanjivg");
  SOURCE_DIR = join(this.KANJIVG_DIR, "kanjivg-20250816-main", "kanji");
  STAGING_DIR = join(this.KANJIVG_DIR, "_kanjivg");
  OUTPUT_PATH = join(this.KANJIVG_DIR, "_kanjivg.tar.gz");

  async ensureSourceDir() {
    await stat(this.SOURCE_DIR);
  }

  async cleanStagingDir() {
    await rm(this.STAGING_DIR, { recursive: true, force: true });
    await mkdir(this.STAGING_DIR, { recursive: true });
  }

  async createRenamedLinks() {
    const entries = await readdir(this.SOURCE_DIR, { withFileTypes: true });
    const svgFiles = entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".svg"))
      .sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of svgFiles) {
      const unicode = basename(entry.name, ".svg");
      const sourcePath = join(this.SOURCE_DIR, entry.name);
      const targetPath = join(this.STAGING_DIR, `_kanjivg_${unicode}.svg`);

      await link(sourcePath, targetPath);
    }

    console.log(`✅ Prepared ${svgFiles.length} KanjiVG SVG links`);
  }

  async compressStagingDir() {
    await rm(this.OUTPUT_PATH, { force: true });

    await new Promise<void>((resolve, reject) => {
      const child = spawn("tar", ["-czf", this.OUTPUT_PATH, "-C", this.STAGING_DIR, "."], {
        stdio: "inherit",
      });

      child.on("error", reject);
      child.on("exit", (code) => {
        if (code === 0) {
          resolve();
          return;
        }

        reject(new Error(`tar exited with code ${code ?? "unknown"}`));
      });
    });

    console.log(`✅ Wrote ${this.OUTPUT_PATH}`);
  }

  async cleanup() {
    await rm(this.STAGING_DIR, { recursive: true, force: true });
  }

  async run() {
    await this.ensureSourceDir();
    await this.cleanStagingDir();

    try {
      await this.createRenamedLinks();
      await this.compressStagingDir();
    } finally {
      await this.cleanup();
    }
  }
}

const script = new Script();
script.run().catch((err) => {
  console.error("❌ Failed to process KanjiVG:", err);
  process.exit(1);
});
