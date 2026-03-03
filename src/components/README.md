# Components

This directory contains all React components organized by purpose.

## Structure

```
components/
├── layout/          # Layout components (navigation, header, footer)
├── ui/              # Reusable UI components (buttons, cards, loading, error)
└── wardrobe/        # Domain-specific wardrobe components
```

## Layout Components

### Navigation (`layout/navigation.tsx`)
- Client component with authentication state management
- Shows different navigation based on logged in/out state
- Listens to Supabase auth changes in real-time

## UI Components

### Loading (`ui/loading.tsx`)
- `LoadingSpinner` - Configurable spinner (sm, md, lg)
- `PageLoader` - Full-page loading state
- `CardLoader` - Loading state for cards/sections

### Error State (`ui/error-state.tsx`)
- `ErrorState` - Reusable error display with retry
- `PageError` - Full-page error state with back button
- Handles Error objects and unknown errors gracefully

### Empty State (`ui/empty-state.tsx`)
- `EmptyState` - Flexible empty state with icon, title, description, and optional action
- Used for "no items yet", "no results found", etc.

### Toast (`ui/toast.tsx`)
- `ToastProvider` - Context provider for toast notifications
- `useToast()` - Hook to show toast messages
- Types: success, error, info
- Auto-dismisses after 3 seconds

### Form Components (`ui/form.tsx`)
- `Input` - Text input with label and error support
- `Textarea` - Multi-line text input
- `Select` - Dropdown with label and error support
- Consistent styling and focus states

### Button (`ui/button.tsx`)
- `Button` - Reusable button with variants and loading states
- Variants: primary, secondary, danger, ghost
- Built-in loading spinner support
- Disabled state handling

## Wardrobe Components

### Wardrobe Card (`wardrobe/wardrobe-card.tsx`)
- `WardrobeCard` - Individual clothing item card with photo, name, category, season, laundry state
- `WardrobeGrid` - Responsive grid layout for wardrobe cards
- Optimized with lazy image loading

### Wardrobe Filters (`wardrobe/wardrobe-filters.tsx`)
- Complete filter panel with category, subcategory, season, color, brand, size, laundry state
- Automatically extracts unique values from items
- Smart subcategory display (only shows when category selected)
- Reset filters button

### Similar Items Slider (`wardrobe/similar-items-slider.tsx`)
- Horizontal scrolling slider for similar items
- Used on item detail page
- Lazy loading images
- Smooth hover effects

## Usage Examples

```tsx
import { LoadingSpinner, PageLoader } from "@/components/ui/loading";
import { ErrorState, PageError } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { Input, Textarea, Select } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/layout/navigation";
import { WardrobeCard, WardrobeGrid } from "@/components/wardrobe/wardrobe-card";
import { WardrobeFilters } from "@/components/wardrobe/wardrobe-filters";
import { SimilarItemsSlider } from "@/components/wardrobe/similar-items-slider";

// Loading
if (loading) return <PageLoader />;

// Error
if (error) return <ErrorState error={error} onRetry={() => refetch()} />;

// Empty
if (items.length === 0) return <EmptyState icon="👔" title="No items yet" />;

// Toast notifications
const { showToast } = useToast();
showToast("Item saved successfully", "success");
showToast("Failed to save", "error");

// Form
<Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
<Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
  <option value="top">Top</option>
  <option value="bottom">Bottom</option>
</Select>

// Button
<Button variant="primary" onClick={onSave} loading={saving}>
  Save
</Button>
<Button variant="danger" onClick={onDelete}>
  Delete
</Button>

// Wardrobe Grid
<WardrobeGrid items={items} />

// Filters
<WardrobeFilters
  items={allItems}
  category={category}
  season={season}
  onCategoryChange={setCategory}
  onSeasonChange={setSeason}
  onReset={() => { setCategory("*"); setSeason("*"); }}
/>

// Individual Card
<WardrobeCard item={item} showLaundryState />

// Similar Items Slider
<SimilarItemsSlider items={similarItems} title="You might also like" />
```

## Best Practices

1. **Keep components small and focused** - Each component should do one thing well
2. **Use TypeScript** - Always type your props and state
3. **Composition over props** - Prefer children and composition patterns
4. **Extract reusable UI** - If you're copying UI code, make a component
5. **Client vs Server** - Use "use client" only when needed (hooks, events, state)
