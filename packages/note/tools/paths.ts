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
  "@/.anki-build/":                            p(".anki-build/"),

  "@/src/index.tsx":                           p("src/index.tsx"),
} as const;
