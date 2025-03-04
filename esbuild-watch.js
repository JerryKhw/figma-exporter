#!/usr/bin/env node
const esbuild = require("esbuild");

async function startBuild() {
    const ctx = await esbuild.context({
        entryPoints: ["src/plugin/code.ts", "src/plugin/data.ts"],
        outdir: "dist",
        bundle: true,
    });

    await ctx.watch();
    console.log("watching...");
}

startBuild().catch(() => process.exit(1));
