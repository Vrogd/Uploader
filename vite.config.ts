import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { resolve } from 'path';
import { writeFileSync, mkdirSync } from 'fs';
import { exec } from 'child_process';

import * as sass from 'sass'

const svelteConfig = defineConfig({
	plugins: [
		sveltekit(),
		{
			name: 'compile-sass',
			buildStart() {
				const result = sass.compile(resolve(import.meta.dirname, 'sass/app.scss'), {
					style: 'compressed'
				});
				// Create static directory if it doesn't exist
				mkdirSync(resolve(import.meta.dirname, 'static'), { recursive: true });

				// Write the compiled CSS to the output file
				writeFileSync(resolve(import.meta.dirname, 'static/output.css'), result.css);
			}
		},
		{
			name: 'npm link',
			apply: 'serve',
			buildEnd() {
				exec('cd dist npm link', (err, stdout, stderr) => {
					if (err) {
						console.error(`Error running npm link: ${err.message}`);
						return;
					}
					if (stderr) {
						console.error(`npm link stderr: ${stderr}`);
						return;
					}
					console.log(`npm link stdout: ${stdout}`);
				});
			}
		}
	],
	build: {
		cssCodeSplit: true,
		rollupOptions: {
			output: {
				manualChunks(id) : string | void {
					if (id.includes('src/styles/')) {
						return 'styles';
					}
				},
			},
		},
	},
	css: {
		preprocessorOptions: {
			scss: {
				silenceDeprecations: ["legacy-js-api"],
			},
		},
	}
});

export default svelteConfig
