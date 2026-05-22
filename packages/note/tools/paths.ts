import { join } from "node:path";

const TOOLS_DIR = import.meta.dirname;
const ROOT = join(TOOLS_DIR, "..");

const p = (path: string) => join(ROOT, path);

/**
 * Common paths used in the note package.
 * Keys starting with "@" represent the package root.
 * Directories end with "/", files do not.
 */
// prettier-ignore
export const paths = {
  "@/":                                        `${ROOT}/`,
  "@/.env":                                    p(".env"),
  "@/package.json":                            p("package.json"),

  "@/src/":                                    p("src/"),
  "@/dist/":                                   p("dist/"),
  "@/preprocess/":                             p("preprocess/"),
  "@/script/":                                 p("script/"),
  "@/tools/":                                  p("tools/"),
  "@/template/":                               p("template/"),
  "@/.anki-build/":                            p(".anki-build/"),

  "@/src/index.tsx":                           p("src/index.tsx"),

  "@/template/front.html":                     p("template/front.html"),
  "@/template/back.html":                      p("template/back.html"),
  "@/template/style.css":                      p("template/style.css"),


  "@/.anki-build/_hakuchou_front.html":        p(".anki-build/_hakuchou_front.html"),
  "@/.anki-build/_hakuchou_back.html":         p(".anki-build/_hakuchou_back.html"),
  "@/.anki-build/_hakuchou_style.css":         p(".anki-build/_hakuchou_style.css"),
  "@/.anki-build/_hakuchou.css":               p(".anki-build/_hakuchou.css"),
  "@/.anki-build/_hakuchou.js":                p(".anki-build/_hakuchou.js"),
  "@/.anki-build/_hakuchou_libs.js":           p(".anki-build/_hakuchou_libs.js"),
} as const;
