# NeatPrayer

A tiny static app for writing a weekly prayer request list and copying it in one tap.
No backend, no database — nothing is stored.

## Use

1. Pick the date (defaults to today).
2. Enter each person's name and their prayer request. **+ Add Person** adds another row.
3. Press **Submit** to render the formatted list, then **Copy**.

## Output format

```
<Prayer Requests (8/16/26)>

• Jihoon: That he would align his actions, life goals, and direction fully with God, keeping his eyes fixed steadfastly on Him.
• David: That he would truly hunger for justice and peace in the world and devote himself to it wholeheartedly.
```

## Deploy (Netlify)

Static site at the repo root — no build step.

- **Drag & drop:** drop this folder onto app.netlify.com/drop.
- **Git:** connect the repo; `netlify.toml` already sets the publish directory to `.` (leave the build command empty).

## Files

- `index.html` — markup and the person-row `<template>`
- `style.css` — styles, light/dark aware
- `script.js` — add/remove rows, formatting, clipboard
