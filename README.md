# create-svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/main/packages/create-svelte).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.


next steps:

Integration next steps ─────────────────────────────────────────────╮
│                                                                      │
│  drizzle:                                                            │
│  - You will need to set DATABASE_URL in your production environment  │
│  - Run npm run db:push to update your database schema                │
│                                                                      │
│  lucia:                                                              │
│  - Run npm run db:push to update your database schema                │
│  - Visit /demo/lucia route to view the demo                          │
│                                                                      │
│  paraglide:                                                          │
│  - Edit your messages in messages/en.json                            │
│  - Consider installing the Sherlock IDE Extension                    │
│  - Visit /demo/paraglide route to view the demo                      │
│                                                                      │
├──────────────────────────────────────────────────────────────────────╯