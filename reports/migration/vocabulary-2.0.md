# Planned renames for 2.0 (vocabulary)

The renames `reports/api/conventions.md` §8 decides, waiting for the next major. None of them is made in 1.x. Before → after.

| Component | Before (1.x) | After (2.0) |
|---|---|---|
| SearchField | `busy` | `loading` |
| ApprovalItem | `deciding` | `loading` |
| QuestionPanel | `sending` | `loading` |
| Composer | `uploading` | named by what it is: `attachmentsLoading` |
| Toast | `tone: "error"` | `tone: "danger"` |
| ProgressRing, Sparkline, SparkBars | `tone: "negative"` | `tone: "danger"` |
| TrayMenu | `tone` (idle, live, paused, busy) | `status` |
| IconButton | `tone: "danger"` | `variant: "danger"` |
| TextField | `size: "sm" \| "lg"`, default `lg` | `size: "sm" \| "md" \| "lg"`, default `md` |
| BottomSheet | `closed` | `open` (inverted) / `onOpenChange` |
| Menu, HoverCard | `placement: "below" \| "above"` / `"down" \| "up"` | `side: "bottom" \| "top"` |
| Tooltip | `side` | `side` (kept) with `align` |
| InlineBanner, UpdateBanner, ConnectionBanner, Toast | `onDismiss()` | `onDismiss(reason?)` |
