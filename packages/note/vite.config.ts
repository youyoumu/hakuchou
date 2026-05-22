import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type PluginOption } from "vite";
import circularDpendency from "vite-plugin-circular-dependency";
import solid from "vite-plugin-solid";
import { paths } from "./tools/paths.js";
import { getVersion } from "./tools/util.js";

const fastBuild = process.env.FAST_BUILD === "true";
const plugins: PluginOption[] = [solid({ ssr: true }), tailwindcss()];
if (!fastBuild) {
  plugins.push(circularDpendency({ outputFilePath: "./.circularDependency.json" }));
}

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "#": paths["@/src/"],
    },
  },
  define: {
    __VERSION__: JSON.stringify(await getVersion()),
  },
  build: {
    lib: {
      entry: paths["@/src/index.tsx"],
      fileName: "_hakuchou",
      formats: ["es"],
    },
    copyPublicDir: false,
    cssCodeSplit: false,
    cssMinify: false,
    minify: false,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              test: (id) => {
                const result = /node_modules/.test(id);
                return result;
              },
              // _hakuchou_libs contains modules that is imported from node_modules
              name: "_hakuchou_libs",
            },
          ],
        },
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
        minify: false,
      },
    },
  },
});
