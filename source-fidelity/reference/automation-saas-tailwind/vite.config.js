import tailwindcss from "@tailwindcss/vite";
import fs from "node:fs";
import path from "node:path";
import { minify } from "terser";
import { defineConfig } from "vite";
import injectHTML from "vite-plugin-html-inject";

const getHtmlEntries = () => {
  const pagesDir = path.resolve(process.cwd(), "");
  const entries = {};

  for (const file of fs.readdirSync(pagesDir)) {
    if (!file.endsWith(".html")) continue;
    entries[path.basename(file, ".html")] = path.resolve(pagesDir, file);
  }

  return entries;
};

const jsToBottomNoModule = () => {
  return {
    name: "no-attribute",
    transformIndexHtml(html) {
      html = html.replace(`type="module" crossorigin`, "");
      let scriptTag = html.match(/<script[^>]*>(.*?)<\/script[^>]*>/)[0];
      html = html.replace(scriptTag, "");
      html = html.replace("<!-- SCRIPT -->", scriptTag);
      return html;
    },
  };
};

const cssCrossOriginRemove = () => {
  return {
    name: "css-cross-origin-remove",
    transformIndexHtml(html) {
      return html.replaceAll(
        /(<link[^>]*rel=["']stylesheet["'][^>]*?)\s+crossorigin(?:=["'][^"']*["'])?/g,
        "$1",
      );
    },
  };
};

const vendorMinifier = () => {
  return {
    name: "vendor-minifier",
    async generateBundle(options, bundle) {
      // Minify vendor scripts after build
      const vendorDir = path.resolve(__dirname, "dist/vendor");

      if (fs.existsSync(vendorDir)) {
        const vendorFiles = fs.readdirSync(vendorDir);

        for (const file of vendorFiles) {
          if (file.endsWith(".js")) {
            const filePath = path.join(vendorDir, file);
            const content = fs.readFileSync(filePath, "utf8");

            try {
              // Use Terser for advanced minification
              const minified = await minify(content, {
                compress: {
                  drop_console: false, // Keep console logs for debugging
                  drop_debugger: true,
                  pure_funcs: ["console.log"], // Remove console.log calls
                  passes: 2,
                },
                mangle: {
                  toplevel: false, // Don't mangle top-level names to avoid breaking
                },
                format: {
                  comments: /@license|@preserve|@format|@version/i, // Preserve license comments
                },
                sourceMap: false,
              });

              // Write minified content back
              fs.writeFileSync(filePath, minified.code);

              // Calculate size reduction
              const originalSize = content.length;
              const minifiedSize = minified.code.length;
              const reduction = (
                ((originalSize - minifiedSize) / originalSize) *
                100
              ).toFixed(1);

              console.log(
                `✅ Minified vendor script: ${file} (${reduction}% smaller)`,
              );
            } catch (error) {
              console.warn(`⚠️ Failed to minify ${file}:`, error.message);
              // Fallback to basic minification
              const basicMinified = content
                .replaceAll(
                  /\/\/(?!.*@license|.*@preserve|.*@format|.*@version).*$/gm,
                  "",
                )
                .replaceAll(
                  /\/\*[\s\S]*?\*\/(?!.*@license|.*@preserve|.*@format|.*@version)/g,
                  "",
                )
                .replaceAll(/\s+/g, " ")
                .replaceAll(/\s*([{}();,=+\-*/<>!&|])\s*/g, "$1")
                .replaceAll(/\s+$/gm, "")
                .replaceAll(/^\s*[\r\n]/gm, "")
                .trim();

              fs.writeFileSync(filePath, basicMinified);
              console.log(`✅ Basic minified vendor script: ${file}`);
            }
          }
        }
      }
    },
  };
};

export default defineConfig({
  plugins: [
    tailwindcss(),
    injectHTML({
      tagName: "Component",
    }),
    jsToBottomNoModule(),
    cssCrossOriginRemove(),
    vendorMinifier(),
  ],
  build: {
    rollupOptions: {
      input: getHtmlEntries(),
      output: {
        entryFileNames: "assets/main.js",
        assetFileNames: (assetInfo) => {
          return `assets/${assetInfo.name || "[name].[ext]"}`;
        },
      },
    },
    minify: false,
    modulePreload: false,
    cssMinify: false,
    assetsDir: "assets",
  },

  server: {
    open: false,
  },
  base: "./",
});
