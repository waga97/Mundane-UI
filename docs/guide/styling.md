---
description: 4 ways to customize mundane-ui's look — from quick CSS variable tweaks to full Tailwind control. No !important wars.
---

# Styling & Theming

The default look is ugly. That's the whole point.

Black borders, black text, white background, zero border radius. It looks like an unstyled HTML table from 2003. And that makes it **trivially easy** to restyle to match whatever Figma your designer threw at you.

Here are four layers of customization, from simplest to most control.

## Layer 1: Theme file

Import a pre-built theme. Right now there's just `plain` (more coming):

```js
import 'mundane-ui/css/plain.css'
```

This gives you the structural CSS (layout, positioning) plus the default visual styles. You'll always import this — it's the foundation.

## Layer 2: CSS custom properties

The fastest way to make it look different. Every visual property is a CSS variable:

```css
.mu-datatable {
  --mu-color-border: #e2e8f0;
  --mu-color-bg-header: #f8fafc;
  --mu-color-bg-hover: #eff6ff;
  --mu-color-accent: #2563eb;
  --mu-border-radius: 6px;
}
```

That's 5 lines and suddenly it looks like a completely different component. No `!important`, no specificity battles.

### Full list of CSS variables

| Variable | Default | What it does |
|----------|---------|--------------|
| `--mu-font-family` | system stack | The font |
| `--mu-font-size` | `14px` | Base text size |
| `--mu-font-size-sm` | `12px` | Small text (info, pagination) |
| `--mu-line-height` | `1.5` | Line height |
| `--mu-color-text` | `#000` | Primary text |
| `--mu-color-text-secondary` | `#666` | Muted text |
| `--mu-color-bg` | `#fff` | Background |
| `--mu-color-bg-header` | `#fff` | Header row background |
| `--mu-color-bg-hover` | `#f5f5f5` | Row hover |
| `--mu-color-bg-even` | `#fafafa` | Alternating row |
| `--mu-color-border` | `#000` | All borders |
| `--mu-color-accent` | `#000` | Active states (current page, sorted column) |
| `--mu-color-loading-bg` | `rgba(255,255,255,0.8)` | Loading overlay |
| `--mu-spacing-xs` through `--mu-spacing-xl` | `4px` to `24px` | Spacing scale |
| `--mu-border-width` | `1px` | Border thickness |
| `--mu-border-radius` | `0px` | Corner rounding |
| `--mu-transition` | `150ms ease` | Hover/state transitions |
| `--mu-shadow` | `none` | Box shadow |
| `--mu-input-height` | `32px` | Search input / select height |

## Layer 3: Direct CSS class overrides

Every element has a BEM class. Target them directly:

```css
.mu-datatable__header-cell {
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 11px;
}

.mu-datatable__cell {
  padding: 16px 20px;
}

.mu-datatable__row:hover {
  background: #dbeafe;
}
```

Full class list in the [Types reference](/api/types#classoverrides).

## Layer 4: Tailwind via config

If you're a Tailwind person, pass utility classes directly in the config object. No CSS files needed:

```js
DataTable.create({
  // ...
  classes: {
    root: 'rounded-xl border border-gray-200 shadow-sm',
    headerCell: 'bg-gray-50 text-xs font-semibold uppercase tracking-wide',
    row: 'hover:bg-blue-50 transition-colors',
    cell: 'px-4 py-3 text-sm',
    pageButtonActive: 'bg-blue-600 text-white rounded',
  },
})
```

These classes are **added alongside** the BEM classes, not replacing them. So structural CSS (layout, flex, positioning) keeps working while your Tailwind classes handle the visuals.

Every element has a corresponding key in the `classes` config. See the [full list](/api/types#classoverrides).

## Live demo

Same component. Zero code changes. Just CSS. This is what it looks like as a SaaS customer table — rounded card container, gray header with uppercase labels, colored status badges, orange accent on sort and pagination. The kind of table you'd see in Stripe or Linear:

<DemoWindow>
  <StylingDemo />
  <template #code>

```css
.my-table {
  --mu-color-bg-header: #f9fafb;
  --mu-color-bg-hover: #f9fafb;
  --mu-color-border: #e5e7eb;
  --mu-color-accent: #ea580c;
  --mu-border-radius: 10px;
}

/* Contained card */
.my-table .mu-datatable__table {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

/* Clean uppercase header */
.my-table .mu-datatable__header-cell {
  color: #6b7280;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* Sorted column highlight */
.my-table .mu-datatable__header-cell--sorted-asc,
.my-table .mu-datatable__header-cell--sorted-desc {
  color: #ea580c;
  background: #fff7ed;
}

/* Subtle row separators */
.my-table .mu-datatable__cell {
  border-bottom: 1px solid #f3f4f6;
}

/* Focus ring on search */
.my-table .mu-datatable__search-input:focus {
  border-color: #ea580c;
  box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.1);
}
```

  </template>
</DemoWindow>

Same component as the ugly black-bordered default. Just CSS. No `!important`. No crying at 2am.
