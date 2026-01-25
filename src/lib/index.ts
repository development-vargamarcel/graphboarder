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

export {
    /**
     * The top-level component that sets up the GraphQL client and schema introspection.
     * Wrap your application or the part that needs GraphQL access with this.
     */
    MainWraper,

    /**
     * The component that establishes the context for a specific GraphQL operation (Query, Mutation, Subscription).
     * Used to define a query, filtering, sorting, and pagination context.
     */
    QMSWraper,

    /**
     * A generic input field component.
     */
    Input,

    /**
     * The logger utility used by the library.
     */
    Logger,

    /**
     * Log levels for the logger.
     */
    LogLevel
};
