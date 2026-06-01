---
name: react-day-picker v9 classNames
description: shadcn calendar.tsx must use v9 classNames keys, not v8 — silent misalignment otherwise
---

# react-day-picker v9 in idalia

The project pins `react-day-picker@^9` (resolved 9.14.x). The shadcn `calendar.tsx`
template that ships with most Lovable/older projects uses the **v8** classNames keys,
which v9 silently ignores → the calendar renders unstyled and badly misaligned.

**Rule:** when touching `artifacts/idalia/src/components/ui/calendar.tsx`, use v9 keys.

**Why:** v9 renamed the entire classNames API. v8→v9 mapping:
- `caption` → `month_caption`
- `nav_button_previous`/`nav_button_next` → `button_previous`/`button_next`
- `table` → `month_grid`; `head_row` → `weekdays`; `head_cell` → `weekday`; `row` → `week`
- `cell` → `day` (now the gridcell wrapper); `day` (button) → `day_button`
- `day_selected`→`selected`, `day_today`→`today`, `day_outside`→`outside`,
  `day_disabled`→`disabled`, `day_hidden`→`hidden`, `day_range_*`→`range_*`
- Custom icons: `components.IconLeft/IconRight` → `components.Chevron` (gets `orientation`)

**How to apply:** since `day` now styles the wrapper `<td>` (not the button), state
styles like `selected`/`today` must target the inner button via `[&>button]:...`.
