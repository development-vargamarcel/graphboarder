import { writable } from 'svelte/store';

/**
 * Represents the type of a toast message.
 */
export type ToastType = 'info' | 'success' | 'warning' | 'error';

/**
 * Represents a toast message object.
 */
export interface ToastMessage {
	id: string;
	type: ToastType;
	message: string;
	timeout?: number;
}

/**
 * Store for managing toast messages.
 */
function createToastStore() {
	const { subscribe, update } = writable<ToastMessage[]>([]);

	/**
	 * Adds a new toast message.
	 * @param message The message text.
	 * @param type The type of the toast (info, success, warning, error).
	 * @param timeout Duration in milliseconds before auto-dismissal. Default is 3000ms.
	 */
	const add = (message: string, type: ToastType = 'info', timeout: number = 3000) => {
		const id = Math.random().toString(36).substring(2, 9);
		update((toasts) => [...toasts, { id, type, message, timeout }]);

		if (timeout) {
			setTimeout(() => {
				remove(id);
			}, timeout);
		}
	};

	/**
	 * Removes a toast message by ID.
	 * @param id The ID of the toast to remove.
	 */
	const remove = (id: string) => {
		update((toasts) => toasts.filter((t) => t.id !== id));
	};

	return {
		subscribe,
		add,
		remove,
		/**
		 * specific helpers
		 */
		info: (message: string, timeout?: number) => add(message, 'info', timeout),
		success: (message: string, timeout?: number) => add(message, 'success', timeout),
		warning: (message: string, timeout?: number) => add(message, 'warning', timeout),
		error: (message: string, timeout?: number) => add(message, 'error', timeout)
	};
}

export const toast = createToastStore();
