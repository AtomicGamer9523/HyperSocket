import esbuild from "npm:esbuild";

await esbuild.build({
    banner: { js: "//deno-lint-ignore-file" },
    entryPoints: ["./client/lib.ts"],
    bundle: true,
    outfile: "./client/lib.js",
    platform: 'browser',
    target: 'es2022',
    minify: true,
    sourcemap: false
});