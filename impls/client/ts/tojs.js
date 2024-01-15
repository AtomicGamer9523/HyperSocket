import esbuild from "npm:esbuild";

await esbuild.build({
    entryPoints: ["./impls/client/ts/lib.ts"],
    bundle: true,
    outfile: "./impls/client/js/lib.js",
    platform: 'browser',
    target: 'es2022',
    minify: true,
    sourcemap: false
});