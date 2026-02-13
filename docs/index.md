---
layout: home
description: "Mundane UI. Zero-dependency, framework-agnostic datatable. 9KB gzipped. Sorting, search, pagination, column filters. Works in React, Vue, Svelte, Angular, or plain HTML. CSS variables and Tailwind support."

hero:
  name: "Mundane UI"
  text: "The boring UI library."
  tagline: "No opinions. No drama. No fighting your component library at 2am to match a Figma. Just a datatable that works, looks like nothing, and gets out of your way. 9KB gzipped. Zero deps."
  image:
    src: /mundane-logo.png
    alt: Mundane UI Logo
  actions:
    - theme: brand
      text: npm install mundane-ui
      link: /guide/getting-started
    - theme: alt
      text: Why does this exist?
      link: /guide/why

features:
  - title: "0 dependencies"
    details: "Go check the package.json. The dependencies object is empty. No lodash. No date-fns. No moment. Just TypeScript compiled to JS."
  - title: "Works everywhere"
    details: "It's a JS class that mounts to a DOM element. React, Vue, Svelte, Angular, plain HTML, a PHP page from 2009. Doesn't matter. No wrappers needed."
  - title: "Ugly on purpose"
    details: "Black borders. Black text. White background. Looks like an HTML table from 2003. So when your designer hands you a Figma, you start from zero instead of fighting someone else's aesthetic."
  - title: "9KB gzipped"
    details: "Sorting, search, pagination, column filters, date parsing, custom columns, XSS protection. All of it. 9KB. A single hero image on most landing pages weighs more than this."
  - title: "CSS is YOUR domain"
    details: "Override CSS variables for quick wins. Target BEM classes for full control. Or pass Tailwind utilities straight in the config. You will never write !important."
  - title: "Two modes"
    details: "Got 200 rows? Frontend mode sorts and paginates in memory. Got 200k rows in Postgres? Backend mode hands you a query string and you go fetch."
---
