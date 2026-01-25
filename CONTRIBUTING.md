# Contributing to Auto-GQL

Thank you for your interest in contributing to Auto-GQL!

## Development Setup

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Start the development server**:
    ```bash
    npm run dev
    ```

3.  **Run checks**:
    We use `svelte-check` for type checking.
    ```bash
    npm run check
    ```

4.  **Run tests**:
    ```bash
    npm test
    ```

## Code Style

-   This project uses Prettier for code formatting.
-   We use Svelte 5 Runes syntax (`$state`, `$derived`, `$props`).

## Logging

Use the provided `Logger` utility instead of `console.log`.

```typescript
import { Logger } from '$lib/utils/logger';

Logger.debug('Debug message');
Logger.info('Info message');
Logger.warn('Warning');
Logger.error('Error', errorObj);
```

## Pull Requests

1.  Create a new branch for your feature or fix.
2.  Ensure `npm run check` passes (or at least doesn't introduce new errors).
3.  Submit a Pull Request with a descriptive title and description.
