import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { resolve } from 'path';
import { writeFileSync, mkdirSync } from 'fs';
import * as sass from 'sass'

const svelteConfig = defineConfig({
	plugins: [
		sveltekit(),
		{
			name: 'compile-sass',
			buildStart() {
				const result = sass.renderSync({
					file: resolve(__dirname, 'sass/app.scss'),
					outputStyle: 'compressed'
				});

				// Create static directory if it doesn't exist
				mkdirSync(resolve(__dirname, 'static'), { recursive: true });

				// Write the compiled CSS to the output file
				writeFileSync(resolve(__dirname, 'static/output.css'), result.css);
			}
		}
	],
	build: {
		cssCodeSplit: true,
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('src/styles/')) {
						return 'styles';
					}
				},
			},
		},
	},
});

export default svelteConfig
