import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import sass from 'rollup-plugin-sass';

const svelteConfig = defineConfig({
	plugins: [
		sveltekit(),
		sass({
			output: "static/output.css",
			outputStyle: "compressed",
		})
	],
	build: {
		cssCodeSplit: true,
		modulePreload: false,
	},
});

export default svelteConfig
