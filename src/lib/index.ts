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
import { Logger, LogLevel } from './utils/logger';

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
     * The logger utility used by the library.
     * Configure log level via `Logger.setLevel(LogLevel.INFO)`.
     */
    Logger,

    /**
     * Log levels for the logger.
     */
    LogLevel
};
