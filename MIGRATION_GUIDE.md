# GraphBoarder shadcn-svelte Migration Guide

> **Complete guide for migrating GraphBoarder components from DaisyUI to shadcn-svelte**

Generated: October 2025
Version: 1.0.0

---

## Table of Contents

1. [Overview](#overview)
2. [Migration Strategy](#migration-strategy)
3. [Component Mapping](#component-mapping)
4. [Step-by-Step Migration](#step-by-step-migration)
5. [Code Examples](#code-examples)
6. [Best Practices](#best-practices)
7. [Common Patterns](#common-patterns)
8. [Troubleshooting](#troubleshooting)

---

## Overview

### What's Been Done

GraphBoarder now has **shadcn-svelte** integrated alongside the existing DaisyUI components. You can migrate components progressively without breaking existing functionality.

**Components Available:**
- ✅ Button
- ✅ Input
- ✅ Switch (Toggle replacement)
- ✅ Dialog (Modal replacement)
- ✅ Card
- ✅ Badge
- ✅ Textarea

**Integration Components Created:**
- ✅ `InputShadcn.svelte` - Compatible with your existing Input API
- ✅ `ToggleShadcn.svelte` - Compatible with your existing Toggle API
- ✅ `ModalShadcn.svelte` - Compatible with your existing Modal API

**Pages Already Updated:**
- ✅ `/endpoints` - Buttons, Cards, Badges
- ✅ `addEndpointToLocalStorage.svelte` - Card structure

### Why Migrate?

- **Modern Design**: Professional, accessible UI components
- **Svelte 5 Native**: Built with runes from the ground up
- **Better DX**: TypeScript support, better autocomplete
- **Customizable**: Easy theme customization with CSS variables
- **Accessible**: ARIA compliant out of the box
- **Consistent**: Unified design system across the app

---

## Migration Strategy

### Recommended Approach

**Phase 1: Foundation (Week 1)**
- ✅ Install and configure shadcn-svelte *(Already done)*
- ✅ Create integration components *(Already done)*
- ✅ Update 2-3 simple pages *(Already done)*

**Phase 2: Core Components (Week 2-3)**
- Replace buttons across the app
- Migrate form inputs and toggles
- Update modal/dialog usage

**Phase 3: Complex Components (Week 4-5)**
- Migrate table components
- Update field components
- Refactor ActiveArguments components

**Phase 4: Polish (Week 6)**
- Remove DaisyUI dependency
- Clean up unused classes
- Add dark mode support

### Migration Checklist

- [ ] Audit all components using DaisyUI
- [ ] Create list of custom components to migrate
- [ ] Migrate page by page, route by route
- [ ] Test each migration thoroughly
- [ ] Update documentation
- [ ] Remove DaisyUI from dependencies

---

## Component Mapping

### Direct Replacements

| DaisyUI Class | shadcn-svelte Component | Location |
|---------------|-------------------------|----------|
| `.btn` | `<Button>` | `$lib/components/ui/button` |
| `.input` | `<Input>` | `$lib/components/ui/input` |
| `.toggle` | `<Switch>` | `$lib/components/ui/switch` |
| `.card` | `<Card.Root>` | `$lib/components/ui/card` |
| `.badge` | `<Badge>` | `$lib/components/ui/badge` |
| `.textarea` | `<Textarea>` | `$lib/components/ui/textarea` |
| `.modal` | `<Dialog.Root>` | `$lib/components/ui/dialog` |

### Custom Component Replacements

| Your Component | shadcn Alternative | Notes |
|----------------|-------------------|-------|
| `fields/Input.svelte` | `InputShadcn.svelte` | API compatible, drop-in replacement |
| `fields/Toggle.svelte` | `ToggleShadcn.svelte` | Supports swap mode and all props |
| `Modal.svelte` | `ModalShadcn.svelte` | Compatible with onApply/onCancel pattern |

---

## Step-by-Step Migration

### 1. Migrating Buttons

**Before (DaisyUI):**
```svelte
<button class="btn btn-primary btn-sm" onclick={handler}>
  Click Me
</button>

<button class="btn btn-error btn-lg" onclick={handler}>
  Delete
</button>

<button class="btn btn-ghost btn-xs" onclick={handler}>
  Cancel
</button>
```

**After (shadcn-svelte):**
```svelte
<script>
  import { Button } from "$lib/components/ui/button";
</script>

<Button size="sm" onclick={handler}>
  Click Me
</Button>

<Button variant="destructive" size="lg" onclick={handler}>
  Delete
</Button>

<Button variant="ghost" size="sm" onclick={handler}>
  Cancel
</Button>
```

**Button Variant Mapping:**
- `btn-primary` → `variant="default"` (default, can omit)
- `btn-secondary` → `variant="secondary"`
- `btn-error` / `btn-warning` → `variant="destructive"`
- `btn-ghost` → `variant="ghost"`
- `btn-outline` → `variant="outline"`
- `btn-link` → `variant="link"`

**Button Size Mapping:**
- `btn-xs` → `size="sm"`
- `btn-sm` → `size="sm"`
- `btn-md` / default → `size="default"` (default, can omit)
- `btn-lg` → `size="lg"`

### 2. Migrating Inputs

**Before (Your Custom Input):**
```svelte
<script>
  import Input from "$lib/components/fields/Input.svelte";

  let value = $state('');
</script>

<Input
  displayInterface="text"
  bind:rawValue={value}
  onChanged={(detail) => console.log(detail)}
/>
```

**After (InputShadcn):**
```svelte
<script>
  import InputShadcn from "$lib/components/fields/InputShadcn.svelte";

  let value = $state('');
</script>

<InputShadcn
  displayInterface="text"
  bind:rawValue={value}
  onChanged={(detail) => console.log(detail)}
/>
```

**Or use the base Input component directly:**
```svelte
<script>
  import { Input } from "$lib/components/ui/input";

  let value = $state('');
</script>

<Input
  type="text"
  bind:value
  placeholder="Enter text..."
/>
```

### 3. Migrating Toggles/Switches

**Before (Your Toggle):**
```svelte
<script>
  import Toggle from "$lib/components/fields/Toggle.svelte";

  let enabled = $state(false);
</script>

<Toggle
  bind:rawValue={enabled}
  showValue={true}
  onChanged={(detail) => console.log(detail)}
/>

<!-- Swap mode -->
<Toggle
  bind:rawValue={enabled}
  useSwap={true}
  swapOnText="Enabled"
  swapOffText="Disabled"
/>
```

**After (ToggleShadcn):**
```svelte
<script>
  import ToggleShadcn from "$lib/components/fields/ToggleShadcn.svelte";

  let enabled = $state(false);
</script>

<ToggleShadcn
  bind:rawValue={enabled}
  showValue={true}
  onChanged={(detail) => console.log(detail)}
/>

<!-- Swap mode -->
<ToggleShadcn
  bind:rawValue={enabled}
  useSwap={true}
  swapOnText="Enabled"
  swapOffText="Disabled"
/>
```

### 4. Migrating Cards

**Before (DaisyUI):**
```svelte
<div class="card w-full glass">
  <div class="card-body">
    <h2 class="card-title">Title</h2>
    <p>Description text</p>
    <div>Content here</div>
    <div class="card-actions justify-end">
      <button class="btn btn-primary">Action</button>
    </div>
  </div>
</div>
```

**After (shadcn-svelte):**
```svelte
<script>
  import * as Card from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
</script>

<Card.Root class="w-full">
  <Card.Header>
    <Card.Title>Title</Card.Title>
    <Card.Description>Description text</Card.Description>
  </Card.Header>
  <Card.Content>
    Content here
  </Card.Content>
  <Card.Footer class="justify-end">
    <Button>Action</Button>
  </Card.Footer>
</Card.Root>
```

### 5. Migrating Modals/Dialogs

**Before (Your Modal):**
```svelte
<script>
  import Modal from "$lib/components/Modal.svelte";

  let showModal = $state(false);
</script>

{#if showModal}
  <Modal
    modalIdetifier="myModal"
    showApplyBtn={true}
    onApply={() => console.log('Applied')}
    onCancel={() => showModal = false}
  >
    <div>Modal content</div>
  </Modal>
{/if}
```

**After (ModalShadcn):**
```svelte
<script>
  import ModalShadcn from "$lib/components/ModalShadcn.svelte";

  let showModal = $state(false);
</script>

{#if showModal}
  <ModalShadcn
    modalIdetifier="myModal"
    bind:open={showModal}
    showApplyBtn={true}
    onApply={() => console.log('Applied')}
    onCancel={() => showModal = false}
  >
    <div>Modal content</div>
  </ModalShadcn>
{/if}
```

**Or use Dialog directly:**
```svelte
<script>
  import * as Dialog from "$lib/components/ui/dialog";
  import { Button } from "$lib/components/ui/button";

  let open = $state(false);
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger>
    <Button>Open Dialog</Button>
  </Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Dialog Title</Dialog.Title>
      <Dialog.Description>Dialog description</Dialog.Description>
    </Dialog.Header>

    <div>Content here</div>

    <Dialog.Footer>
      <Button variant="outline" onclick={() => open = false}>Cancel</Button>
      <Button onclick={() => console.log('Applied')}>Apply</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
```

### 6. Migrating Badges

**Before (DaisyUI):**
```svelte
<span class="badge badge-primary">5</span>
<span class="badge badge-error">Error</span>
<span class="badge badge-outline">Info</span>
```

**After (shadcn-svelte):**
```svelte
<script>
  import { Badge } from "$lib/components/ui/badge";
</script>

<Badge>5</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Info</Badge>
```

---

## Code Examples

### Example 1: Complete Page Migration

**File: `src/routes/example/+page.svelte`**

**Before:**
```svelte
<script>
  let name = $state('');
  let enabled = $state(false);
  let showModal = $state(false);
</script>

<div class="card">
  <div class="card-body">
    <h2 class="card-title">Settings</h2>

    <input type="text" class="input input-bordered" bind:value={name} />

    <label class="label cursor-pointer">
      <span class="label-text">Enable feature</span>
      <input type="checkbox" class="toggle" bind:checked={enabled} />
    </label>

    <div class="card-actions">
      <button class="btn btn-primary" onclick={() => showModal = true}>
        Save
      </button>
    </div>
  </div>
</div>
```

**After:**
```svelte
<script>
  import * as Card from "$lib/components/ui/card";
  import { Input } from "$lib/components/ui/input";
  import { Switch } from "$lib/components/ui/switch";
  import { Button } from "$lib/components/ui/button";

  let name = $state('');
  let enabled = $state(false);
  let showModal = $state(false);
</script>

<Card.Root>
  <Card.Header>
    <Card.Title>Settings</Card.Title>
  </Card.Header>
  <Card.Content class="space-y-4">
    <div class="space-y-2">
      <label class="text-sm font-medium">Name</label>
      <Input type="text" bind:value={name} />
    </div>

    <div class="flex items-center justify-between">
      <label class="text-sm font-medium">Enable feature</label>
      <Switch bind:checked={enabled} />
    </div>
  </Card.Content>
  <Card.Footer>
    <Button onclick={() => showModal = true}>Save</Button>
  </Card.Footer>
</Card.Root>
```

### Example 2: Form with Validation

```svelte
<script>
  import * as Card from "$lib/components/ui/card";
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";

  let email = $state('');
  let password = $state('');
  let errors = $state<string[]>([]);

  const validateForm = () => {
    errors = [];
    if (!email.includes('@')) errors.push('Invalid email');
    if (password.length < 8) errors.push('Password too short');
    return errors.length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      console.log('Form valid!');
    }
  };
</script>

<Card.Root class="max-w-md mx-auto">
  <Card.Header>
    <Card.Title>Login</Card.Title>
    <Card.Description>Enter your credentials</Card.Description>
  </Card.Header>
  <Card.Content class="space-y-4">
    {#if errors.length > 0}
      <div class="space-y-1">
        {#each errors as error}
          <Badge variant="destructive">{error}</Badge>
        {/each}
      </div>
    {/if}

    <div class="space-y-2">
      <label class="text-sm font-medium">Email</label>
      <Input type="email" bind:value={email} placeholder="you@example.com" />
    </div>

    <div class="space-y-2">
      <label class="text-sm font-medium">Password</label>
      <Input type="password" bind:value={password} placeholder="••••••••" />
    </div>
  </Card.Content>
  <Card.Footer>
    <Button class="w-full" onclick={handleSubmit}>Sign In</Button>
  </Card.Footer>
</Card.Root>
```

---

## Best Practices

### 1. Progressive Migration

**DO:**
- ✅ Migrate one page/component at a time
- ✅ Test thoroughly after each migration
- ✅ Keep both old and new components during transition
- ✅ Update related components together

**DON'T:**
- ❌ Try to migrate everything at once
- ❌ Remove old components before new ones are tested
- ❌ Mix DaisyUI and shadcn classes on same element
- ❌ Skip testing edge cases

### 2. Naming Conventions

**Component Naming:**
- Integration components: `ComponentNameShadcn.svelte`
- Original components: Keep as-is during migration
- New components: Use shadcn naming from the start

**Import Aliases:**
```svelte
// Good: Namespace for multi-part components
import * as Card from "$lib/components/ui/card";
import * as Dialog from "$lib/components/ui/dialog";

// Good: Direct import for single components
import { Button } from "$lib/components/ui/button";
import { Input } from "$lib/components/ui/input";

// Avoid: Renaming for no reason
import { Button as Btn } from "$lib/components/ui/button"; // ❌
```

### 3. Styling Approach

**Use Tailwind Utilities:**
```svelte
<!-- Good: Use Tailwind for spacing and layout -->
<Card.Root class="max-w-2xl mx-auto">
  <Card.Content class="space-y-4 p-6">
    ...
  </Card.Content>
</Card.Root>

<!-- Avoid: Custom CSS when Tailwind suffices -->
<Card.Root style="max-width: 42rem; margin: 0 auto;"> <!-- ❌ -->
```

**Consistent Spacing:**
- Use `space-y-4` for vertical stacking
- Use `gap-4` for flexbox/grid
- Use `p-4`, `p-6` for padding consistency
- Use `mb-4`, `mt-4` sparingly, prefer `space-y-*`

### 4. Accessibility

**Always provide labels:**
```svelte
<!-- Good -->
<div class="space-y-2">
  <label for="email" class="text-sm font-medium">Email</label>
  <Input id="email" type="email" bind:value={email} />
</div>

<!-- Bad -->
<Input type="email" bind:value={email} /> <!-- ❌ No label -->
```

**Use semantic HTML:**
```svelte
<!-- Good -->
<form onsubmit={handleSubmit}>
  <Button type="submit">Submit</Button>
</form>

<!-- Avoid -->
<div>
  <Button onclick={handleSubmit}>Submit</Button> <!-- ❌ Not in form -->
</div>
```

---

## Common Patterns

### Pattern 1: Form Field Group

```svelte
<script>
  import { Input } from "$lib/components/ui/input";

  let value = $state('');
  let error = $state('');
</script>

<div class="space-y-2">
  <label for="field" class="text-sm font-medium">
    Field Label
    {#if error}
      <span class="text-destructive text-xs ml-2">{error}</span>
    {/if}
  </label>
  <Input
    id="field"
    type="text"
    bind:value
    class={error ? 'border-destructive' : ''}
  />
  <p class="text-xs text-muted-foreground">Helper text here</p>
</div>
```

### Pattern 2: Action Bar

```svelte
<script>
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
</script>

<div class="flex items-center justify-between p-4 border-b">
  <div class="flex items-center gap-2">
    <h2 class="text-lg font-semibold">Page Title</h2>
    <Badge>12 items</Badge>
  </div>
  <div class="flex gap-2">
    <Button variant="outline" size="sm">Cancel</Button>
    <Button size="sm">Save</Button>
  </div>
</div>
```

### Pattern 3: List with Actions

```svelte
<script>
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import * as Card from "$lib/components/ui/card";

  let items = $state([
    { id: 1, name: 'Item 1', status: 'active' },
    { id: 2, name: 'Item 2', status: 'inactive' }
  ]);
</script>

<div class="space-y-2">
  {#each items as item}
    <Card.Root>
      <Card.Content class="flex items-center justify-between p-4">
        <div class="flex items-center gap-3">
          <span class="font-medium">{item.name}</span>
          <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
            {item.status}
          </Badge>
        </div>
        <div class="flex gap-2">
          <Button variant="ghost" size="sm">Edit</Button>
          <Button variant="destructive" size="sm">Delete</Button>
        </div>
      </Card.Content>
    </Card.Root>
  {/each}
</div>
```

### Pattern 4: Settings Panel

```svelte
<script>
  import * as Card from "$lib/components/ui/card";
  import { Switch } from "$lib/components/ui/switch";

  let settings = $state({
    notifications: true,
    darkMode: false,
    autoSave: true
  });
</script>

<Card.Root>
  <Card.Header>
    <Card.Title>Settings</Card.Title>
    <Card.Description>Manage your preferences</Card.Description>
  </Card.Header>
  <Card.Content class="space-y-4">
    {#each Object.entries(settings) as [key, value]}
      <div class="flex items-center justify-between">
        <div>
          <p class="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
          <p class="text-sm text-muted-foreground">Enable {key}</p>
        </div>
        <Switch bind:checked={settings[key]} />
      </div>
    {/each}
  </Card.Content>
</Card.Root>
```

---

## Troubleshooting

### Issue: Components not found

**Error:**
```
Cannot find module '$lib/components/ui/button'
```

**Solution:**
Ensure the component is installed:
```bash
# Check if file exists
ls src/lib/components/ui/button/button.svelte

# If missing, the component wasn't created
# Refer to the setup section
```

### Issue: Styles not applying

**Problem:** Components appear unstyled

**Solutions:**
1. Check `app.postcss` includes shadcn variables
2. Verify `tailwind.config.cjs` has shadcn theme config
3. Ensure `@tailwind base;` is before custom CSS
4. Restart dev server after config changes

### Issue: TypeScript errors

**Error:**
```
Type 'string' is not assignable to type '"default" | "destructive" | ...'
```

**Solution:**
```svelte
<!-- Instead of dynamic strings -->
<Button variant={someVar}> <!-- ❌ -->

<!-- Use proper typing -->
<script lang="ts">
  import type { ButtonProps } from "$lib/components/ui/button";

  let variant: ButtonProps['variant'] = 'default';
</script>
<Button {variant}> <!-- ✅ -->
```

### Issue: Context errors with InputShadcn

**Error:**
```
Cannot read properties of undefined (reading 'mutationVersion')
```

**Solution:**
Ensure context is set:
```svelte
<script>
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';

  // Set before using InputShadcn
  setContext('mutationVersion', writable(false));
</script>
```

---

## Next Steps

### Immediate Actions

1. **Review this guide** with your team
2. **Choose next pages** to migrate (suggest: `/endpoints/[id]` pages)
3. **Set migration timeline** (recommend 4-6 weeks)
4. **Create migration tasks** in your project board

### Recommended Migration Order

**Week 1:**
- [ ] Simple standalone pages
- [ ] Button replacements across app
- [ ] Badge replacements

**Week 2:**
- [ ] Form pages with inputs
- [ ] Settings/configuration pages
- [ ] Modal/dialog heavy pages

**Week 3:**
- [ ] Complex components (ActiveArguments, etc.)
- [ ] Table-heavy pages
- [ ] Field components

**Week 4:**
- [ ] Testing and refinement
- [ ] Performance optimization
- [ ] Documentation updates

### Resources

- **shadcn-svelte Docs**: https://shadcn-svelte.com
- **Component Examples**: `/test-shadcn`, `/graphql-builder`, `/integration-demo`
- **Migration Examples**: This guide + updated `/endpoints` page
- **Integration Components**: `InputShadcn`, `ToggleShadcn`, `ModalShadcn`

---

## Appendix: Quick Reference

### Import Cheatsheet

```svelte
<script>
  // Single components
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Switch } from "$lib/components/ui/switch";
  import { Badge } from "$lib/components/ui/badge";
  import { Textarea } from "$lib/components/ui/textarea";

  // Multi-part components
  import * as Card from "$lib/components/ui/card";
  import * as Dialog from "$lib/components/ui/dialog";

  // Integration components
  import InputShadcn from "$lib/components/fields/InputShadcn.svelte";
  import ToggleShadcn from "$lib/components/fields/ToggleShadcn.svelte";
  import ModalShadcn from "$lib/components/ModalShadcn.svelte";
</script>
```

### Common Props

**Button:**
- `variant`: default | secondary | destructive | outline | ghost | link
- `size`: sm | default | lg | icon

**Input:**
- `type`: text | email | password | number | ...
- `value`: bindable
- `placeholder`: string

**Switch:**
- `checked`: bindable boolean
- `disabled`: boolean

**Badge:**
- `variant`: default | secondary | destructive | outline

---

**End of Migration Guide**

For questions or issues, refer to the integration demo pages or shadcn-svelte documentation.
