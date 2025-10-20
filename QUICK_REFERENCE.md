# shadcn-svelte Quick Reference Card

> **Quick lookup for common migrations**

---

## Component Imports

```svelte
<script>
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Switch } from "$lib/components/ui/switch";
  import { Badge } from "$lib/components/ui/badge";
  import { Textarea } from "$lib/components/ui/textarea";
  import * as Card from "$lib/components/ui/card";
  import * as Dialog from "$lib/components/ui/dialog";

  // Integration components (API compatible with your existing components)
  import InputShadcn from "$lib/components/fields/InputShadcn.svelte";
  import ToggleShadcn from "$lib/components/fields/ToggleShadcn.svelte";
  import ModalShadcn from "$lib/components/ModalShadcn.svelte";
</script>
```

---

## Buttons

### DaisyUI → shadcn-svelte

| DaisyUI | shadcn-svelte |
|---------|---------------|
| `<button class="btn">` | `<Button>` |
| `btn-primary` | `variant="default"` (default) |
| `btn-secondary` | `variant="secondary"` |
| `btn-error` | `variant="destructive"` |
| `btn-ghost` | `variant="ghost"` |
| `btn-outline` | `variant="outline"` |
| `btn-link` | `variant="link"` |
| `btn-xs` / `btn-sm` | `size="sm"` |
| `btn-lg` | `size="lg"` |

### Examples

```svelte
<!-- Before -->
<button class="btn btn-primary btn-sm">Save</button>
<button class="btn btn-error">Delete</button>

<!-- After -->
<Button size="sm">Save</Button>
<Button variant="destructive">Delete</Button>
```

---

## Inputs

### Simple Input

```svelte
<!-- Before -->
<input type="text" class="input input-bordered" bind:value={text} />

<!-- After -->
<Input type="text" bind:value={text} />
```

### With Your API (InputShadcn)

```svelte
<!-- Before -->
<Input displayInterface="text" bind:rawValue={value} onChanged={handler} />

<!-- After (same API!) -->
<InputShadcn displayInterface="text" bind:rawValue={value} onChanged={handler} />
```

---

## Toggle/Switch

### Basic Toggle

```svelte
<!-- Before -->
<input type="checkbox" class="toggle" bind:checked={enabled} />

<!-- After -->
<Switch bind:checked={enabled} />
```

### With Your API (ToggleShadcn)

```svelte
<!-- Before -->
<Toggle bind:rawValue={enabled} showValue={true} />

<!-- After (same API!) -->
<ToggleShadcn bind:rawValue={enabled} showValue={true} />
```

---

## Cards

```svelte
<!-- Before -->
<div class="card">
  <div class="card-body">
    <h2 class="card-title">Title</h2>
    <p>Content</p>
    <div class="card-actions">
      <button class="btn">Action</button>
    </div>
  </div>
</div>

<!-- After -->
<Card.Root>
  <Card.Header>
    <Card.Title>Title</Card.Title>
  </Card.Header>
  <Card.Content>
    <p>Content</p>
  </Card.Content>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card.Root>
```

---

## Modals/Dialogs

### With Dialog Component

```svelte
<Dialog.Root bind:open>
  <Dialog.Trigger>
    <Button>Open</Button>
  </Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Title</Dialog.Title>
      <Dialog.Description>Description</Dialog.Description>
    </Dialog.Header>
    <div>Content</div>
    <Dialog.Footer>
      <Button>Save</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
```

### With Your API (ModalShadcn)

```svelte
<!-- Before -->
<Modal
  showApplyBtn={true}
  onApply={handler}
  onCancel={() => show = false}
>
  Content
</Modal>

<!-- After (same API!) -->
<ModalShadcn
  bind:open={show}
  showApplyBtn={true}
  onApply={handler}
  onCancel={() => show = false}
>
  Content
</ModalShadcn>
```

---

## Badges

```svelte
<!-- Before -->
<span class="badge badge-primary">5</span>

<!-- After -->
<Badge>5</Badge>
<Badge variant="secondary">5</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Info</Badge>
```

---

## Common Patterns

### Form Field

```svelte
<div class="space-y-2">
  <label class="text-sm font-medium">Email</label>
  <Input type="email" bind:value={email} />
  <p class="text-xs text-muted-foreground">We'll never share your email</p>
</div>
```

### Toggle with Label

```svelte
<div class="flex items-center justify-between">
  <label class="text-sm font-medium">Enable notifications</label>
  <Switch bind:checked={enabled} />
</div>
```

### Action Bar

```svelte
<div class="flex items-center justify-between">
  <h2 class="text-lg font-semibold">Title</h2>
  <div class="flex gap-2">
    <Button variant="outline">Cancel</Button>
    <Button>Save</Button>
  </div>
</div>
```

### List Item

```svelte
<div class="flex items-center justify-between p-4 border rounded-md">
  <div class="flex items-center gap-2">
    <span class="font-medium">Item Name</span>
    <Badge>New</Badge>
  </div>
  <Button variant="ghost" size="sm">Edit</Button>
</div>
```

---

## Spacing Classes

| Use Case | Class |
|----------|-------|
| Vertical stack | `space-y-2`, `space-y-4`, `space-y-6` |
| Horizontal stack | `space-x-2`, `space-x-4` |
| Flex gap | `gap-2`, `gap-4` |
| Padding | `p-2`, `p-4`, `p-6` |
| Margin | `m-2`, `m-4`, `m-6` |

---

## Color Classes

| Purpose | Class |
|---------|-------|
| Primary text | `text-foreground` (default) |
| Secondary text | `text-muted-foreground` |
| Error text | `text-destructive` |
| Small text | `text-sm`, `text-xs` |
| Large text | `text-lg`, `text-xl` |
| Bold text | `font-medium`, `font-semibold`, `font-bold` |

---

## Demo Pages

- **Basic Components**: http://localhost:5176/test-shadcn
- **GraphQL Builder**: http://localhost:5176/graphql-builder
- **Real Integration**: http://localhost:5176/integration-demo
- **Updated Endpoints**: http://localhost:5176/endpoints

---

## Need Help?

1. Check `MIGRATION_GUIDE.md` for detailed examples
2. View demo pages for interactive examples
3. Refer to shadcn-svelte docs: https://shadcn-svelte.com
