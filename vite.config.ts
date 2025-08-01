import { defineConfig } from "vite";
import path from "path";
import preact from "@preact/preset-vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// https://vitejs.dev/config/
export default defineConfig({
    root: "./src/ui",
    plugins: [preact(), viteSingleFile()],
    build: {
        target: "esnext",
        outDir: "../../dist",
    },
    resolve: {
        alias: {
            "@ui": path.resolve(__dirname, "./src/ui"),
            "@common": path.resolve(__dirname, "./src/common"),
            react: "preact/compat",
            "react-dom/test-utils": "preact/test-utils",
            "react-dom": "preact/compat",
            "react/jsx-runtime": "preact/jsx-runtime",
        },
    },
});
