import fs from "fs";
import { resolve } from "path";
import { Plugin } from "vite";

export default function globalCss(): Plugin {
  return {
    name: "global-css",

    writeBundle(option, bundle) {
      const styles = bundle["style.css"];
      if (styles && styles.type === "asset" && styles.source && option.dir) {
        const code = `
          window.HamsterbaseHighlighterStyle = "${Buffer.from(
            styles.source
          ).toString("base64")}";
        `;
        fs.writeFileSync(resolve(option.dir, `${styles.fileName}.js`), code);
      }
    },
  };
}
