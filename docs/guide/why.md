---
description: Why Mundane UI exists, who it's for, and why the world needed yet another component library.
---

# Why This Exists

## The Problem

I work at a software house. We build apps for clients. Every project needs the same stuff. Datatables, dropdowns, calendars, date pickers. And every Figma looks completely different.

Here's how it goes. Every. Single. Time.

1. Client sends Figma designs
2. Designer made the datatable look beautiful and unique
3. I pick a datatable library
4. I spend **3 days fighting its CSS** to match the Figma
5. I google "override [library name] header background color" and end up on some ancient forum post from 2019 where a guy named `xX_darkCoder_Xx` suggests `!important` on everything
6. I write more CSS overrides than actual application code
7. Next client, different design, repeat from step 1

Every datatable library out there falls into one of two traps:

**Trap 1: Framework-locked.** React Table only works in React. Vuetify only works in Vue. We use different frameworks depending on the client. Maintaining expertise in 5 different datatable libraries is not a thing anyone should have to do.

**Trap 2: Over-styled.** The library ships looking "pretty" with rounded corners, gradients, custom scrollbars, and 400KB of CSS. Looks great on their docs page. Becomes a nightmare when your designer wants something completely different. You end up chaining `!important` like your life depends on it.

## The Solution

What if a datatable:

- Was **just a JavaScript class** that mounts to any DOM element? No framework lock-in. Works in React, Vue, Angular, Svelte, or a plain HTML page served from a PHP backend that hasn't been touched since 2009.
- Looked like **nothing** by default? Black borders. Black text. White background. The most boring table you've ever seen. So when a designer hands you a Figma, you start from zero instead of undoing someone else's design decisions.
- Had **functionality that just works**? Sorting works. Pagination works. Search is debounced. Dates parse correctly. XSS is handled. You don't think about it.
- Was **9KB gzipped** with zero dependencies? Because your client's e-commerce site doesn't need 150KB of datatable code.

That's mundane-ui.

## Who Is This For?

**Agency and software house devs** who build different projects with different designs and are tired of re-learning a new component library every time.

**Tailwind people** who want to pass utility classes directly to table elements without a CSS fight.

**Devs who don't use React** (or don't want to be locked into it). Vue, Svelte, HTMX, Alpine, plain JS. All good.

**People who care about bundle size.** If you're building a dashboard and don't want to ship 200KB of table component to your users.

**People who hate fighting CSS.** The default theme is ugly on purpose. Change `--mu-color-border` and `--mu-border-radius` and suddenly it matches your design system. 30 seconds.

## Who Is This NOT For?

If you want a datatable that looks gorgeous out of the box with zero CSS work, use [AG Grid](https://www.ag-grid.com/) or [TanStack Table](https://tanstack.com/table) with a UI kit. They're great. No shade.

If you need virtual scrolling for 100K+ rows, this isn't that. Yet.

If you need drag-and-drop columns, row selection, inline editing, cell merging, Excel-like features, this isn't that either. Yet. This does the basics and does them well.

## The Name

Mundane means ordinary. Boring. Everyday. That's the point. A datatable is not exciting. It shouldn't be. It should work, look however you need it to, and get out of the way so you can build the parts of your app that actually matter.

---

Ready? [Get started in 30 seconds &rarr;](/guide/getting-started)
