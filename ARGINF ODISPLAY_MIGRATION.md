# ArgInfoDisplay Component Migration

> **Step-by-step migration of a complex GraphQL component**

---

## Component Overview

**ArgInfoDisplay** is a complex component that displays GraphQL field information in your query builder. It has two templates:
1. `default` - Displays field metadata with expand buttons
2. `changeArguments` - Interactive list for selecting fields

---

## What Was Migrated

### Before: `ArgInfoDisplay.svelte`
- Uses DaisyUI classes (`btn`, `btn-xs`, `btn-info`, `bg-secondary`)
- Manual hover states
- Inline styling
- Bootstrap Icons

### After: `ArgInfoDisplayShadcn.svelte`
- Uses shadcn-svelte components (`<Button>`, `<Badge>`)
- Built-in hover and focus states
- Consistent design system
- Improved accessibility

---

## Migration Changes

### 1. Imports Added

```svelte
// Add these imports at the top
import { Button } from "$lib/components/ui/button";
import { Badge } from "$lib/components/ui/badge";
```

### 2. Button Transformations

**Expand/Collapse Button:**

Before:
```svelte
<div class="btn btn-xs p-1 rounded normal-case" onclick={expand}>
  {showExpand ? '-' : '+'}
</div>
```

After:
```svelte
<Button size="sm" variant="outline" class="h-8 w-8 p-0" onclick={expand}>
  {showExpand ? '-' : '+'}
</Button>
```

**Disabled Button:**

Before:
```svelte
<div class="btn btn-xs p-1 rounded normal-case btn-disabled" onclick={expand}>
  +
</div>
```

After:
```svelte
<Button size="sm" variant="outline" class="h-8 w-8 p-0" disabled onclick={expand}>
  +
</Button>
```

**Info Button:**

Before:
```svelte
<div class="btn btn-xs btn-info normal-case font-light" onclick={() => console.log(type)}>
  {dd_displayName}
</div>
```

After:
```svelte
<Button size="sm" variant="secondary" class="font-normal" onclick={() => console.log(type)}>
  {dd_displayName}
</Button>
```

### 3. Badge Transformations

**Index Badge:**

Before:
```svelte
<div class="bg-secondary p-1 rounded">{index + 1}</div>
```

After:
```svelte
<Badge variant="secondary">{index + 1}</Badge>
```

**Type Badge:**

Before:
```svelte
<div class="bg-secondary p-1 rounded">
  {dd_kindsArray.join(' of ')}
</div>
```

After:
```svelte
<Badge variant="secondary" class="text-xs">
  {dd_kindsArray.join(' of ')}
</Badge>
```

**Required Badge (New):**

```svelte
{#if dd_NON_NULL}
  <Badge variant="destructive" class="ml-2 text-xs h-5">Required</Badge>
{/if}
```

### 4. Interactive List Item

**Template: 'changeArguments'**

Before:
```svelte
<label
  class="cursor-pointer hover:text-primary px-2 py-2 rounded-box flex text-base min-w-max w-full active:font-black duration-100 select-none"
  onclick={() => {
    if (dd_kindEl == 'INPUT_OBJECT') {
      addContainer();
    } else {
      addFilter();
    }
  }}
>
  <div class="pr-2 w-full min-w-max {dd_NON_NULL && 'underline underline-offset-0'}">
    {dd_displayName}
  </div>
  <!-- ... -->
</label>
```

After:
```svelte
<button
  class="cursor-pointer hover:bg-accent hover:text-accent-foreground px-3 py-2.5 rounded-md flex items-center justify-between w-full transition-colors duration-100 select-none text-left border border-transparent hover:border-border"
  onclick={() => {
    if (dd_kindEl == 'INPUT_OBJECT') {
      addContainer();
    } else {
      addFilter();
    }
  }}
>
  <div class="flex-1 pr-4 {dd_NON_NULL ? 'underline underline-offset-2 font-medium' : ''}">
    <span class="text-sm">{dd_displayName}</span>
    {#if dd_NON_NULL}
      <Badge variant="destructive" class="ml-2 text-xs h-5">Required</Badge>
    {/if}
  </div>
  <!-- ... -->
</button>
```

### 5. Layout Improvements

**Flexbox Alignment:**

Before:
```svelte
<div class="flex space-x-2">
  <div class="flex space-x-2 w-1/3">
    <!-- content -->
  </div>
  <div class="w-1/2">
    <!-- content -->
  </div>
</div>
```

After:
```svelte
<div class="flex items-center gap-2">
  <div class="flex items-center gap-2 w-1/3">
    <!-- content -->
  </div>
  <div class="w-1/2">
    <div class="flex items-center gap-2">
      <!-- content -->
    </div>
  </div>
</div>
```

Changes:
- `space-x-2` → `gap-2` (more consistent)
- Added `items-center` for better vertical alignment
- Nested flex containers for complex layouts

---

## Visual Improvements

### 1. Better Visual Hierarchy

- **Required fields** now have a red "Required" badge
- **Object types** have "Object" or "List" labels
- **Consistent spacing** with gap-2 throughout

### 2. Improved Hover States

Before:
- Only text color changed (`hover:text-primary`)

After:
- Background color changes (`hover:bg-accent`)
- Text color changes (`hover:text-accent-foreground`)
- Border appears (`hover:border-border`)
- Smooth transitions

### 3. Better Accessibility

- Proper button semantics (changed `<label>` to `<button>`)
- Focus indicators built into Button component
- ARIA attributes from shadcn-svelte

---

## Testing Checklist

After migrating, test these scenarios:

- [ ] **Expand/collapse** buttons work correctly
- [ ] **Disabled state** displays properly for non-expandable items
- [ ] **Click handlers** fire correctly (argAddRequest, containerAddRequest)
- [ ] **Required fields** show the Required badge
- [ ] **Object types** show correct icons (bi-box, bi-card-list)
- [ ] **Hover states** work on all interactive elements
- [ ] **Type information** displays correctly
- [ ] **Both templates** render properly (default & changeArguments)

---

## How to Apply This Migration

### Step 1: Create the new component

The shadcn-svelte version is already created at:
```
src/lib/components/ArgInfoDisplayShadcn.svelte
```

### Step 2: Update imports in parent components

Find files that import `ArgInfoDisplay`:
```bash
grep -r "import.*ArgInfoDisplay" src/lib/components/
```

Replace:
```svelte
import ArgInfoDisplay from "$lib/components/ArgInfoDisplay.svelte";
```

With:
```svelte
import ArgInfoDisplayShadcn from "$lib/components/ArgInfoDisplayShadcn.svelte";
```

### Step 3: Update component usage

Replace:
```svelte
<ArgInfoDisplay ... />
```

With:
```svelte
<ArgInfoDisplayShadcn ... />
```

**Note:** All props remain the same! The API is identical.

### Step 4: Test thoroughly

Visit pages that use this component and test all interactions.

### Step 5: Remove old component (optional)

Once fully tested, you can remove the original:
```bash
# Rename for safety first
mv src/lib/components/ArgInfoDisplay.svelte src/lib/components/ArgInfoDisplay.svelte.backup

# If everything works, delete the backup later
```

---

## See It In Action

Visit the comparison demo:
```
http://localhost:5176/migration-comparison
```

This page shows:
- ✅ Side-by-side comparison of both versions
- ✅ Code differences highlighted
- ✅ Interactive examples
- ✅ Migration benefits explained

---

## Lessons Learned

### 1. Component Consistency

Using shadcn-svelte components ensures:
- All buttons have the same height
- All badges have consistent padding
- Colors match the design system

### 2. Less Custom CSS

Before: Many custom Tailwind classes for hover states
After: Built-in component variants handle it

### 3. Better Semantics

Changed from `<label>` to `<button>` for better accessibility

### 4. Easier Maintenance

Changes to button styles can be made in one place (button.svelte) instead of updating every instance

---

## Next Component to Migrate

Good candidates that use similar patterns:

1. **Arg.svelte** - Uses buttons and expansion
2. **ActiveArgument.svelte** - Uses Toggle and Modal
3. **FilterItem.svelte** - Uses buttons and inputs

Each of these will follow the same migration pattern demonstrated here!

---

**Migration Time:** ~30 minutes
**Difficulty:** Moderate
**Impact:** High (better UX, consistency, accessibility)
