/**
 * Auto-GQL Library
 *
 * A Svelte 5 library for auto-generating GraphQL UIs.
 *
 * @module auto-gql
 */

import MainWraper from './components/MainWraper.svelte';
import QMSWraper from './components/QMSWraper.svelte';
import Input from './components/fields/Input.svelte';
import LogViewer from './components/UI/LogViewer.svelte';
import { Logger, LogLevel } from './utils/logger';
import { addToHistory, exportHistory, importHistory, queryHistory } from './stores/queryHistory';
import { toast } from './stores/toastStore';

// Export types
export type { QMSMainWraperContext, QMSWraperContext } from './types/index';

export {
	/**
	 * The top-level component that sets up the GraphQL client and schema introspection.
	 * Wrap your application or the part that needs GraphQL access with this.
	 *
	 * @example
	 * ```svelte
	 * <MainWraper endpointInfoProvided={{ url: '...' }}>
	 *   <App />
	 * </MainWraper>
	 * ```
	 */
	MainWraper,

	/**
	 * The component that establishes the context for a specific GraphQL operation (Query, Mutation, Subscription).
	 * Used to define a query, filtering, sorting, and pagination context.
	 *
	 * @example
	 * ```svelte
	 * <QMSWraper QMSName="users" QMSType="query">
	 *   <MyComponent />
	 * </QMSWraper>
	 * ```
	 */
	QMSWraper,

	/**
	 * A generic input field component that adapts to the data type.
	 */
	Input,

	/**
	 * A UI component to view system logs.
	 */
	LogViewer,

	/**
	 * The logger utility used by the library.
	 * Configure log level via `Logger.setLevel(LogLevel.INFO)`.
	 */
	Logger,

	/**
	 * Log levels for the logger.
	 */
	LogLevel,

	/**
	 * Add a query to the history.
	 */
	addToHistory,

	/**
	 * Export the history as a JSON string.
	 */
	exportHistory,

	/**
	 * Import history from a JSON string.
	 */
	importHistory,

	/**
	 * The history store.
	 */
	queryHistory,

	/**
	 * The toast notification store.
	 * Use `toast.info()`, `toast.success()`, `toast.error()`, `toast.warning()` to display messages.
	 */
	toast
};
