import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from '@rollup/plugin-commonjs';
import sveltePreprocess from "svelte-preprocess";
import typescript from "@rollup/plugin-typescript";
import pkg from './package.json';

const production = !process.env.ROLLUP_WATCH;
const name = pkg.name
    .replace(/^(@\S+\/)?(svelte-)?(\S+)/, '$3')
    .replace(/^\w/, m => m.toUpperCase())
    .replace(/-\w/g, m => m[1].toUpperCase());
const buildPath = 'public/';
const sourcePathSass = './sass';
const sourcePath = 'src/';

// svelte config
const configSvelte = {
    input: sourcePath + "/svelte/main.ts",
    output: [
        {
            file: pkg.module,
            format: 'es',
            sourcemap: production,
        },
        {
            file: pkg.main,
            format: 'umd',
            name,
            sourcemap: production,
        },
    ],
    plugins: [
        svelte({
            compilerOptions: {
                // enable run-time checks when not in production
                dev: false,
                customElement: true,
            },
            preprocess: sveltePreprocess({
                postcss: true,
                scss: {
                    outputStyle: "compressed"
                },
            }),

        }),

        // If you have external dependencies installed from
        // npm, you'll most likely need these plugins. In
        // some cases you'll need additional configuration —
        // consult the documentation for details:
        // https://github.com/rollup/rollup-plugin-commonjs
        resolve({
            browser: true,
            dedupe: ['svelte'],
        }),
        commonjs(),
        typescript( {sourceMap: false}),
    ]
};

import sass from 'rollup-plugin-sass';
// sass test setup not final sass
const sassConfig = {

    input: sourcePathSass + '/app.scss',
    output: {
        dir:  buildPath,
        inlineDynamicImports: true
    },
    plugins: [
        sass({
            output: buildPath + "output.css",
            outputStyle: "compressed",
        })
    ]
}

export default [configSvelte, sassConfig]