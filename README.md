# NeatPrayer

A tiny static app for writing a weekly prayer request list and copying it in one tap.
No backend, no database — nothing is stored.

## Use

1. Pick the date (defaults to today).
2. Enter each person's name and their prayer request. **+ Add Person** adds another row.
3. Press **Submit** to render the formatted list, then **Copy**.

## Output format

```
<Prayer Request 8/16/26>

• 권현: 스스로의 행동과 삶의목표, 그리고 방향성을 하나님께 맞추고 시선을 고정하기를.

• Max 멘토님: 오픈 순예배때 정말로 갈급하고 필요한 사람들을 초대 할 수 있기를.
```

## Deploy (Netlify)

Static site at the repo root — no build step.

- **Drag & drop:** drop this folder onto app.netlify.com/drop.
- **Git:** connect the repo; `netlify.toml` already sets the publish directory to `.` (leave the build command empty).

## Files

- `index.html` — markup and the person-row `<template>`
- `style.css` — styles, light/dark aware
- `script.js` — add/remove rows, formatting, clipboard
