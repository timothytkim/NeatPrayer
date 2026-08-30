# Neat Prayer

> 모든 기도제목을, 가장 단정하게.
> Every prayer request. Beautifully in line.

A tiny static app for writing a prayer request list and copying it in one tap.
Three files, no build step, no backend, no database — nothing you type is stored
or sent anywhere.

## Use

1. Pick the date (defaults to today) and, optionally, a title.
2. Type each person's name and prayer request straight into the table cells.
   The **+ 인원 추가 / + Add Person** row at the bottom of the table adds another person;
   the ✕ on the right removes one (hidden when only one row is left).
3. Reorder people by dragging the ⠿ handle in the 번호 / No. column — mouse or touch —
   or by focusing a handle and pressing ↑ / ↓. Numbers renumber themselves as you go.
4. Press **만들기 / Submit** to render the formatted list.
5. **복사 / Copy** puts it on the clipboard, **PDF로 저장 / Save as PDF** opens the
   print dialog with everything but the list stripped away, and
   **이미지로 저장 / Save as Image** downloads the list as a PNG.
6. The callout at the bottom holds a standing invitation note with its own copy button.

Blank rows are skipped. A row with only one of the two fields filled is highlighted
and blocks submission. A trailing `:` after a name is dropped so you never get `홍길동::`,
and line breaks inside a request collapse to spaces so every bullet stays one line.

## Title

The 제목 / Title property is optional and goes into the header, in the right place for
each language:

```
한국어   <2026-08-21 청년부 기도제목>      비우면  <2026-08-21 기도제목>
English  <Youth Group Prayer Request 8/21/26>   blank   <Prayer Request 8/21/26>
```

## Language

A `한국어 / English` toggle sits at the top right. Korean is the default. Everything in
the UI is localized from a single `I18N` object at the top of `script.js` — adding a
language means adding one object.

The date order follows the language, and switching languages re-renders an
already-submitted list:

```
한국어   <2026-08-21 기도제목>
English  <Prayer Request 8/21/26>
```

## Output format

```
<2026-08-21 청년부 기도제목>

• 홍길동: 새 학기를 앞두고 마음을 잘 준비할 수 있도록, 매일의 선택에서 하나님을 먼저 바라보게 되기를.

• 김민수: 이번 주 가족들과 함께 예배드릴 수 있기를. 아버지 건강 회복을 위해 기도 부탁드립니다.

• 이서연: 새로 시작하는 일터에서 좋은 사람들을 만나고, 그곳에서 선한 영향력을 끼칠 수 있도록.
```

## Design

Notion's design language, in Neat Prayer's colors:

| | |
|---|---|
| `#e4002b` | accent — active language, focus rings, Submit, the quote bar |
| `#000000` | text, headings, toast |
| `#575a5d` | labels and secondary text |
| `#b5b7b4` | placeholders, row numbers, and hairlines at 45% opacity |

Page icon and title, a quote block for the tagline, the date as a page property, and a
database-style table whose inputs are invisible until focused. Light only — no dark mode.
Under 600px the table rows stack into labeled cards.

## PDF export

`Save as PDF` calls `window.print()` against a print stylesheet that hides everything
except the list, and swaps `document.title` so the suggested file name is
`기도제목 2026-08-21`.

This is deliberate rather than a JS PDF library: jsPDF and friends ship no Hangul
glyphs, so Korean renders as tofu boxes unless you embed a multi-megabyte Korean font.
The browser already has the fonts.

## Deploy (Netlify)

Static site at the repo root — no build step.

- **Git:** connect this repo in Netlify; `netlify.toml` sets the publish directory to `.`
  (leave the build command empty). Every push to `main` redeploys.
- **Drag & drop:** drop this folder onto app.netlify.com/drop.

## Files

- `index.html` — markup, the person-row `<template>`, and `data-i18n` hooks
- `style.css` — Notion-style layout, responsive rules, print sheet
- `script.js` — i18n, add/remove/reorder rows, formatting, clipboard, print, image export
- `netlify.toml` — publish directory
