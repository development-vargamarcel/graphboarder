# Auto-GQL (GraphBoarder)

A powerful Svelte 5 library for auto-generating GraphQL UIs, handling complex queries, filtering, sorting, and pagination with ease.

## Features

- **Automatic UI Generation:** Generates tables, forms, and filters based on your GraphQL schema.
- **Advanced Filtering & Sorting:** Supports infinitely nested filtering and sorting.
- **Pagination:** Built-in support for various pagination strategies (limit/offset, cursor-based, etc.).
- **Svelte 5 Support:** Built using the latest Svelte 5 Runes syntax for optimal performance and DX.
- **Headless & Customizable:** Provides the logic and stores, giving you full control over the UI components.

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
    // You can add headers here if needed
    headers: {}
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
  const columns = [
    { title: 'ID', stepsOfFields: ['characters', 'id'] },
    { title: 'Name', stepsOfFields: ['characters', 'name'] },
    { title: 'Status', stepsOfFields: ['characters', 'status'] }
  ];
</script>

<QMSWraper
  QMSName={queryName}
  QMSType="query"
  tableColsData_StoreInitialValue={columns}
>
  <MyArticlesComponent />
</QMSWraper>
```

### 3. Consume Data in Components

Inside your component (e.g., `MyArticlesComponent.svelte`), you can access the stores provided by `QMSWraper`.

```svelte
<script>
  import { getContext } from 'svelte';

  // Note: The context key might be prefixed if you provided a prefix to MainWraper
  const context = getContext('QMSWraperContext');
  const { QMS_bodyPartsUnifier_StoreDerived } = context;

  // In Svelte 5, you can use $derived or $effect to react to store changes
  $effect(() => {
    console.log('Query Body:', $QMS_bodyPartsUnifier_StoreDerived);
    // You can now execute this query using your preferred method or the built-in client
  });
</script>

<div>
  <!-- Build your UI here -->
</div>
```

## Terminology

- **QMS:** Query, Mutation, or Subscription.
- **QMSWraper:** The component that establishes the context for a specific GraphQL operation.
- **MainWraper:** The top-level component that sets up the GraphQL client and schema introspection.

## Development

This project uses Svelte 5 Runes (`$state`, `$derived`, `$props`). Ensure your environment supports it.

### Type Safety & Context

To improve Developer Experience (DX) and type safety, use the provided context interfaces when accessing `MainWraper` or `QMSWraper` contexts.

```typescript
import { getContext } from 'svelte';
import type { QMSMainWraperContext, QMSWraperContext } from 'auto-gql'; // or '$lib/types/index'

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

## License

MIT
