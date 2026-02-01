// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
	/**
	 * Server-side locals available in hooks and server-only load functions
	 */
	interface Locals {
		// Add any server-side session data or user info here
		// Example: user?: { id: string; name: string }
	}

	/**
	 * Data available to all pages via `data` prop
	 * Individual pages extend this with their own types via `PageData` from ./$types
	 */
	interface PageData {
		// Common data available to all pages
	}

	/**
	 * Custom error shape
	 */
	interface Error {
		message: string;
		code?: string;
		stack?: string;
	}

	/**
	 * Platform-specific context (for adapters like Vercel, Cloudflare, etc.)
	 */
	interface Platform {
		// Adapter-specific platform data
		// Example for Vercel: env?: Record<string, string>
	}
}

// Extend global window object for browser-side types if needed
declare global {
	// Example: const __APP_VERSION__: string
	namespace svelteHTML {
		interface HTMLAttributes<T> {
			onclick_outside?: (event: CustomEvent) => void;
		}
	}
}

export {};
