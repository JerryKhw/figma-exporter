#!/usr/bin/env node
import { build, context } from "esbuild";

const isWatch = process.argv.includes("--watch");

const buildOptions = {
    entryPoints: ["src/plugin/code.ts"],
    outdir: "dist",
    bundle: true,
    target: "es2017",
    format: "iife",
};

async function run() {
    if (isWatch) {
        try {
            const ctx = await context(buildOptions);
            await ctx.watch();
            console.log("esbuild: watching for changes...");
        } catch (error) {
            console.error("esbuild: watch failed", error);
            process.exit(1);
        }
    } else {
        try {
            await build({
                ...buildOptions,
                minify: true,
            });
            console.log("esbuild: build successful");
        } catch (error) {
            console.error("esbuild: build failed", error);
            process.exit(1);
        }
    }
}

run();
