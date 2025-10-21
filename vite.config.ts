import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import type { UserConfig } from 'vite';

const config: UserConfig = {
	plugins: [
		tailwindcss(),
		sveltekit()
	],
	optimizeDeps: {
		exclude: ['svelte']
	}
};

export default config;
