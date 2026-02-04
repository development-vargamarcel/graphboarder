# Auto-GQL (GraphBoarder)

A powerful Svelte 5 library for auto-generating GraphQL UIs, handling complex queries, filtering, sorting, and pagination with ease.

## Features

- **Automatic UI Generation:** Generates tables, forms, and filters based on your GraphQL schema.
- **Advanced Filtering & Sorting:** Supports infinitely nested filtering and sorting.
- **Pagination:** Built-in support for various pagination strategies (limit/offset, cursor-based, etc.).
- **Svelte 5 Support:** Built using the latest Svelte 5 Runes syntax for optimal performance and DX.
- **Headless & Customizable:** Provides the logic and stores, giving you full control over the UI components.
- **Built-in Logging:** Includes a configurable logger for debugging.
- **Theme Support:** Built-in Light and Dark mode toggle.
- **Execute Queries:** Execute queries directly from the editor and view results.
- **Code Snippets:** Generate code snippets for various clients (Fetch, URQL, Apollo, Python Requests).
- **Toast Notifications:** Built-in toast notification system for user feedback.

## Installation

```bash
npm install auto-gql
```

## Getting Started

### 1. Wrap your application

Wrap your application or the part that needs GraphQL access with `MainWraper`. This handles the GraphQL client initialization and context setup.

```svelte
<script>
	import { MainWraper } from 'auto-gql';

	const endpointInfo = {
		url: 'https://rickandmortyapi.com/graphql',
		// Optional headers
		headers: {
			// 'Authorization': 'Bearer ...'
		},
		// Optional heuristics for identifying fields (see EndpointConfiguration)
		idFieldNamePossibilities: ['id', '_id'],
		countFieldNamePossibilities: ['count', 'totalCount']
	};
</script>

<MainWraper endpointInfoProvided={endpointInfo}>
	<!-- Your app content here -->
	<slot />
</MainWraper>
```

### 2. Create a Query Wrapper

Use `QMSWraper` (Query/Mutation/Subscription Wrapper) to define a specific operation context.

```svelte
<script>
	import { QMSWraper } from 'auto-gql';
	import MyArticlesComponent from './MyArticlesComponent.svelte';

	const queryName = 'characters';
	// Define initial columns if you want to preload data or customize display
	const columns = [
		{ title: 'ID', stepsOfFields: ['characters', 'id'] },
		{ title: 'Name', stepsOfFields: ['characters', 'name'] },
		{ title: 'Status', stepsOfFields: ['characters', 'status'] }
	];
</script>

<QMSWraper QMSName={queryName} QMSType="query" tableColsData_StoreInitialValue={columns}>
	<MyArticlesComponent />
</QMSWraper>
```

### 3. Consume Data in Components

Inside your component (e.g., `MyArticlesComponent.svelte`), you can access the stores provided by `QMSWraper`.

```svelte
<script lang="ts">
	import { getContext } from 'svelte';
	import type { QMSWraperContext } from 'auto-gql';

	// Access the context provided by QMSWraper
	const context = getContext<QMSWraperContext>('QMSWraperContext');

	// Destructure the stores you need
	// QMS_bodyPartsUnifier_StoreDerived contains the constructed GraphQL query body
	// paginationState contains current pagination info
	const { QMS_bodyPartsUnifier_StoreDerived, paginationState } = context;

	// React to changes using Svelte 5 runes
	$effect(() => {
		console.log('Current Query Body:', $QMS_bodyPartsUnifier_StoreDerived);
	});
</script>

<div>
	<!-- Build your UI here using the stores -->
	<pre>{JSON.stringify($paginationState, null, 2)}</pre>
</div>
```

## Logging

Auto-GQL includes a robust logging system to help debug query execution and context issues.

```typescript
import { Logger, LogLevel } from 'auto-gql';

// Set log level to INFO (suppresses DEBUG logs)
Logger.setLevel(LogLevel.INFO);

// Usage
Logger.debug('This is a debug message');
Logger.error('Something went wrong', { details: '...' });
```

Logs are automatically generated for:

- Initialization of wrappers.
- Query execution start, success, and failure.
- Fetch requests (via URQL).

## Log Viewer

Auto-GQL includes a built-in Log Viewer to inspect system logs, which is useful for debugging and monitoring application state.

### Accessing the Log Viewer

In the demo application, click the **Terminal Icon** (<i class="bi bi-terminal"></i>) in the header to open the Log Viewer.

### Features

- **Live Logs:** View real-time logs from the application.
- **Filtering:** Filter logs by text or log level (DEBUG, INFO, WARN, ERROR).
- **Copy:** Copy individual logs or clear the entire history.
- **Persisted:** Logs are stored in memory (up to 500 entries).

### Using Log Viewer in Your App

You can import and use the `LogViewer` component in your own application:

```svelte
<script>
	import { LogViewer } from 'auto-gql';
	let showLogs = $state(false);
</script>

<button onclick={() => (showLogs = true)}>Open Logs</button>

{#if showLogs}
	<LogViewer onClose={() => (showLogs = false)} />
{/if}
```

## Endpoint Manager

Auto-GQL allows you to manage multiple GraphQL endpoints.

- **Access:** Click the **Endpoints** button (network drive icon) in the bottom of the sidebar.
- **Functionality:**
  - **List:** View all available endpoints (built-in and custom).
  - **Add:** Add new custom endpoints with URL and headers.
  - **Switch:** Click an endpoint to switch the application context to that endpoint.
  - **Delete:** Remove custom endpoints.
  - **Persisted:** Custom endpoints are saved in `localStorage`.

## Query Metrics

Auto-GQL automatically measures and displays useful metrics for each query execution.

- **Execution Time:** The time taken (in milliseconds) is shown in a badge (e.g., `<i class="bi bi-stopwatch"></i> 150ms`).
- **Response Size:** The approximate size of the response payload is shown in a badge (e.g., `<i class="bi bi-hdd-network"></i> 1.2 KB`).
- **Query Complexity:** In the query editor, a real-time analysis of the query complexity (Depth / Field Count) is displayed to help estimate performance impact.

## Query History

Auto-GQL allows you to persist and restore executed queries.

- **Automatic:** If using the provided `GraphqlCodeDisplay` and `ComponentForLayout` setup, queries are automatically saved to `localStorage` when executed.
- **Manual:** You can manually add queries to history using `addToHistory`.
- **Favorites:** You can mark queries as favorites (star icon) to keep them at the top of the list.
- **Renaming:** Click on a query name in the history to rename it for easier identification.
- **Export/Import:** You can export your query history to a JSON file and import it on another device or for backup.

## Query Collections

Auto-GQL allows you to organize your saved queries into collections (folders).

- **Create Collections:** Create named collections to group related queries.
- **Move Queries:** Easily move saved queries into collections or back to the "Unsorted" list.
- **Manage:** Rename or delete collections. Deleting a collection moves its queries to the "Unsorted" list.
- **Filter:** View all queries, only favorites, or filter by specific collections.

## Headers Editor

Auto-GQL allows you to configure HTTP headers (e.g., Authorization tokens) for your GraphQL requests directly from the UI.

- **Access:** Click the **Settings** button (gear icon) at the bottom of the sidebar.
- **Functionality:**
  - View, add, edit, and delete headers.
  - Headers are persisted in `localStorage`.
  - Supports both global headers and endpoint-specific headers (if the endpoint ID is available).
  - **Presets:** Save sets of headers as named presets for quick switching between configurations (e.g., "Admin", "User", "Guest").

### Data Export

The `Table` component supports exporting data to CSV and JSON formats.

- **CSV Export:** Click the "Export CSV" button.
- **JSON Export:** Click the "Export JSON" button.

### Filters Management

You can manage active filters and arguments using the `ActiveArguments` component.
A "Clear All Filters" button allows you to quickly reset all active arguments to their default state.

```typescript
import { addToHistory } from 'auto-gql';

addToHistory({
	query: 'query { ... }',
	endpointId: 'my-endpoint',
	operationName: 'getUsers'
});
```

To view and restore history, the `GraphqlCodeDisplay` component includes a "History" button that opens a modal with saved queries.

## Schema Visualizer

Auto-GQL includes a **Schema Visualizer** to help you explore and understand the GraphQL schema.

- **Access:** Click the **Schema** link in the sidebar (icon <i class="bi bi-diagram-3"></i>).
- **Functionality:**
  - **Browse Types:** Searchable list of all types defined in the schema (Objects, Scalars, Enums, Interfaces, etc.).
  - **Type Details:** View detailed information about any type, including description, fields, arguments, input fields, and implemented interfaces.
  - **Navigation:** Click on interface names to jump to their definitions.
  - **Copy Introspection:** Button to copy the full introspection result to clipboard.

## Mock Data Generator

Auto-GQL can generate mock response data for your queries based on the schema. This is useful for frontend development when the backend is not ready or to test UI handling of data structures.

- **Usage:** In the code display view (where the query is shown), click the **Mock Data** button (<i class="bi bi-code-slash"></i> icon).
- **Functionality:** It parses the current query and generates realistic random data (Strings, Ints, Lists, Objects) matching the schema types.

## Format Query

Auto-GQL allows you to format (prettify) your GraphQL query directly in the editor.

- **Access:** In the code display view, click the **Prettify** button (<i class="bi bi-magic"></i>).
- **Functionality:** Formats the query with proper indentation and line breaks using Prettier.

## Import from cURL

Auto-GQL allows you to import a GraphQL query and headers from a cURL command (e.g., copied from Chrome DevTools).

- **Access:** In the code display view, click the **Import cURL** button (<i class="bi bi-box-arrow-in-down"></i>).
- **Functionality:**
  - Parses the cURL command to extract the GraphQL query **and variables**.
  - Updates the current query and variables in the editor.
  - Merges any extracted headers (e.g., `Authorization`) with your existing persisted headers.

## Variables Editor

Auto-GQL allows you to define and manage variables for your GraphQL queries.

- **Access:** In the code display view, click the **Variables** button (<i class="bi bi-braces"></i>).
- **Functionality:**
  - Opens a dedicated JSON editor for variables.
  - Includes a **Prettify** button to format the JSON.
  - Validates JSON before execution.
  - Variables are included in query execution, sharing, cURL generation, and code snippets.

## Execute Query

You can execute the current query directly from the `GraphqlCodeDisplay` component.

- **Access:** In the code display view, click the **Execute** button (<i class="bi bi-play-fill"></i>).
- **Functionality:**
  - Executes the query using the configured URQL client.
  - Displays the JSON result (or error) in a dedicated view within the component.
  - Allows copying the result to clipboard.

## Code Snippets

Auto-GQL can generate code snippets for your query in various languages and clients.

- **Access:** In the code display view, click the **Snippets** button (<i class="bi bi-code-square"></i>).
- **Functionality:**
  - Opens a modal where you can select the target language (JavaScript/Fetch, JavaScript/URQL, JavaScript/Apollo, Python/Requests).
  - Generates ready-to-use code including the query, variables, and headers.
  - Allows copying the snippet to the clipboard.

## Export to Postman

Auto-GQL allows you to export your current GraphQL query and headers as a Postman Collection.

- **Access:** In the code display view, click the **Postman** button (<i class="bi bi-collection"></i>).
- **Functionality:**
  - Generates a Postman Collection v2.1 JSON file.
  - Includes the query, variables, and headers.
  - Downloads the file, which can be imported directly into Postman.

## Copy as Markdown

Quickly copy the current query formatted as a Markdown code block (e.g., for GitHub issues or Slack).

- **Access:** In the code display view, click the **Copy MD** button (<i class="bi bi-markdown"></i>).
- **Functionality:** Copies the query to the clipboard wrapped in \`\`\`graphql ... \`\`\`.

## Share Query

Auto-GQL allows you to share your current query via a URL.

- **Access:** In the code display view, click the **Share** button (<i class="bi bi-share"></i>).
- **Functionality:**
  - Compresses the current query **and variables** into a URL parameter.
  - Copies the full URL to the clipboard.
  - When someone opens the link, the query (and variables) are automatically restored in the editor.
- **Enable:** To use this feature, set the `enableShareUrl` prop to `true` on `GraphqlCodeDisplay`.

## Toast Notifications

Auto-GQL includes a built-in toast notification system for providing feedback to users (e.g., success messages, errors).

- **Usage:** Import `toast` from `auto-gql`.
- **Methods:** `toast.info(msg)`, `toast.success(msg)`, `toast.error(msg)`, `toast.warning(msg)`.
- **Integration:** The `ToastContainer` is automatically included in `MainWraper`.

## Theme Support

GraphBoarder supports Light and Dark modes. The theme can be toggled using the button in the header. The preference is persisted in `localStorage`.

## Advanced Configuration

### EndpointInfo

The `endpointInfo` object passed to `MainWraper` controls how Auto-GQL interprets your schema. You can customize heuristics for finding:

- **Rows Location:** Where the list of items is in the response (e.g., `edges`, `nodes`).
- **Row Count:** Where the total count is found.
- **IDs:** How to identify the ID field.
- **Pagination:** Which arguments control pagination (limit, offset, cursor).

See `EndpointConfiguration` interface in the codebase for full options.

### Active Arguments

`activeArgumentsDataGrouped_Store` manages the state of arguments (filters, sorting, etc.). You can access it from `QMSWraperContext` to build custom filter UIs.

## Terminology

- **QMS:** Query, Mutation, or Subscription.
- **QMSWraper:** The component that establishes the context for a specific GraphQL operation.
- **MainWraper:** The top-level component that sets up the GraphQL client and schema introspection.

## Development

This project uses Svelte 5 Runes (`$state`, `$derived`, `$props`).

### Type Safety & Context

To improve Developer Experience (DX) and type safety, use the provided context interfaces when accessing `MainWraper` or `QMSWraper` contexts.

```typescript
import { getContext } from 'svelte';
import type { QMSMainWraperContext, QMSWraperContext } from 'auto-gql';

// Accessing MainWraper context
let mainWraperContext = getContext<QMSMainWraperContext>(`${prefix}QMSMainWraperContext`);
const endpointInfo = mainWraperContext?.endpointInfo; // EndpointInfoStore
const schemaData = mainWraperContext?.schemaData; // Readable<SchemaData>

// Accessing QMSWraper context
const qmsContext = getContext<QMSWraperContext>(`${prefix}QMSWraperContext`);
```

### Running Tests

```bash
npm test
```

### Building

```bash
npm run build
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development instructions.

## License

MIT
