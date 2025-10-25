import adapter from '@sveltejs/adapter-auto';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [
		preprocess({
			postcss: true
		})
	],

	kit: {
		adapter: adapter()
	},

	compilerOptions: {
		// Run in compatibility mode - allows Svelte 4 syntax to work with Svelte 5
		// Set to true to enable runes mode and migrate to Svelte 5 syntax
		runes: undefined
	}
};

export default config;
