import { mkdir, readFile, writeFile } from "node:fs/promises";
import { paths } from "../tools/paths.ts";
import { getVersion, log } from "../tools/util.js";

class Script {
  PATHS = {
    FRONT_SRC: paths["@/template/front.html"],
    BACK_SRC: paths["@/template/back.html"],
    STYLE_SRC: paths["@/template/style.css"],

    FRONT_DEST: paths["@/.anki-build/_hakuchou_front.html"],
    BACK_DEST: paths["@/.anki-build/_hakuchou_back.html"],
    STYLE_DEST: paths["@/.anki-build/_hakuchou_style.css"],
  };

  async ensureDestDir() {
    await mkdir(paths["@/.anki-build/"], { recursive: true });
  }

  async loadSources() {
    const [front, back, style] = await Promise.all([
      readFile(this.PATHS.FRONT_SRC, "utf8"),
      readFile(this.PATHS.BACK_SRC, "utf8"),
      readFile(this.PATHS.STYLE_SRC, "utf8"),
    ]);
    return { front, back, style };
  }

  async buildTemplates(src: { front: string; back: string; style: string }) {
    const version = `v${await getVersion()}`;

    const front = src.front.replace("__VERSION__", version);
    const back = src.back.replace("__VERSION__", version);
    const style = src.style.replace("__VERSION__", version);

    return { front, back, style };
  }

  async writeOutputs(templates: { front: string; back: string; style: string }) {
    await Promise.all([
      writeFile(this.PATHS.FRONT_DEST, templates.front),
      writeFile(this.PATHS.BACK_DEST, templates.back),
      writeFile(this.PATHS.STYLE_DEST, templates.style),
    ]);
  }

  async run() {
    await this.ensureDestDir();
    const sources = await this.loadSources();
    const templates = await this.buildTemplates(sources);
    await this.writeOutputs(templates);
  }
}

const script = new Script();
script
  .run()
  .then(() => {
    console.log("✅ Generated template");
  })
  .catch((err) => {
    console.error("❌ Failed to generate template:", err);
    process.exit(1);
  });
