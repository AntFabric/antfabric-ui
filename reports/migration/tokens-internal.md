# Internal tokens

297 of the 670 tokens are internal: they resolve and can be themed like any other, and are left out of the Foundations page, `llms.txt`, the default `pnpm describe tokens` listing and the Figma library.

Two kinds:

- **Pictures of OS chrome**, whole groups: `os`, `osBadge`, `osNotification`, `osTray`, `osMenu`, `osWindow`, `osHeader` (159 tokens).
- **One component's private geometry** (138 tokens, below): offsets, insets, least and most sizes, loading placeholders, breakpoints and chart plot internals. Decided by the owner on 24 November 2026, by rule.

To make one public again, take its key off its group's `internal` list in `packages/core/src/token-registry.ts`, then run `pnpm tokens:build` and `pnpm api:lock`.

## `sheet`

| Token | What it is |
|---|---|
| `sheet.grabberWidth` | Width of the grab handle at the top of a sheet, dialog or banner on the phone: the 36 × 5 handle iOS draws. |
| `sheet.grabberHeight` | Height of the grab handle at the top of a sheet, dialog or banner on the phone; with sheet.grabberWidth, drawn as a pill. |
| `sheet.contentMinHeight` | Shortest the sheet's content area is, so a sheet with little in it still looks like a sheet. |
| `sheet.titleLineHeight` | Line height of a sheet or dialog title on the phone; font.lineHeight.lead is 28 there and these titles keep 24. |

## `iconButton`

| Token | What it is |
|---|---|
| `iconButton.badgeOffsetY` | How far a count badge sits above an icon button's top edge (negative: it hangs outside). |
| `iconButton.badgeOffsetX` | How far a count badge sits past an icon button's right edge (negative: it hangs outside). |

## `segmentedControl`

| Token | What it is |
|---|---|
| `segmentedControl.countSize` | Minimum width and height of the count pill beside a segment's label. |
| `segmentedControl.cardInset` | How far the chosen segment's card extends past the segment's box, to cover its own transparent edge so nothing moves when the choice changes. |

## `choice`

| Token | What it is |
|---|---|
| `choice.pillGap` | Gap between the pills of a radio group drawn as pills. |
| `choice.ringOffsetY` | The optical push that drops a radio's ring onto the first line of its label. |

## `radioGroup`

| Token | What it is |
|---|---|
| `radioGroup.cardMinWidth` | The least width of an option in a radio group drawn as cards (appearance cards) on web and desktop: the cards fill the row in as many columns of at least this width as fit, and wrap. The phone stacks them one per row. |

## `select`

| Token | What it is |
|---|---|
| `select.chipHeight` | Height of the select drawn as a chip. |
| `select.triggerGap` | Gap between the value and the caret in the chip and link selects. |
| `select.panelMaxHeight` | Tallest the open list grows before it scrolls. |
| `select.panelMinWidth` | Narrowest the open list of an inline link select gets, so a short value does not make a thin list. |
| `select.dotGap` | Space between a select's chosen-option dot and the option's label. |

## `textField`

| Token | What it is |
|---|---|
| `textField.tagPaddingX` | Side padding of the small tag a field can show beside its label. |
| `textField.trailingOffsetX` | Pull-out that lets a trailing control (a clear or reveal button) sit on the field's inner edge rather than behind its padding. |
| `textField.prefixOffsetX` | Pull-in that tightens a field's prefix (a $ or a domain) against the text, leaving about 4 between them: -4 on web and desktop. |

## `inAppBanner`

| Token | What it is |
|---|---|
| `inAppBanner.dismissInset` | Right padding that leaves room for the banner's close button. |

## `notificationItem`

| Token | What it is |
|---|---|
| `notificationItem.kindBadgeSize` | Side of the badge on a notification's avatar that says what kind it is. |
| `notificationItem.kindBadgeRadius` | Corner radius of the kind badge on a notification's avatar. |
| `notificationItem.textGap` | Gap between a notification's title and its body. |
| `notificationItem.metaGap` | Gap between a notification's time and its unread dot. |

## `notificationSchedule`

| Token | What it is |
|---|---|
| `notificationSchedule.noteMaxWidth` | Widest the schedule's explanatory note grows before it wraps. |

## `permissionPrompt`

| Token | What it is |
|---|---|
| `permissionPrompt.addressHeight` | Height of the browser's address chip that shows the page asking. |
| `permissionPrompt.lockSize` | Side of the lock disc inside the browser's address chip. |

## `breadcrumbs`

| Token | What it is |
|---|---|
| `breadcrumbs.recordingGap` | Gap between the recording pill's dot and its label. |
| `breadcrumbs.recordingDotSize` | Diameter of the dot in the recording pill. |
| `breadcrumbs.crumbMaxWidth` | Widest a crumb grows before its label truncates. |

## `tabs`

| Token | What it is |
|---|---|
| `tabs.countSize` | Minimum width and height of the count pill beside a tab's label: 20pt on the phone, 18 on web and desktop. |

## `navRail`

| Token | What it is |
|---|---|
| `navRail.badgeOffsetY` | How far a rail item's corner badge sits above the item. |
| `navRail.badgeOffsetX` | How far in from the item's left edge a rail item's corner badge starts. |
| `navRail.logoFontSize` | Font size of the letter in the logo mark. |
| `navRail.chipHeight` | Height of the chip beside a rail item's label. |

## `sidebarSection`

| Token | What it is |
|---|---|
| `sidebarSection.hashWidth` | Width of the # that marks a channel row, so every channel name starts on one edge. |
| `sidebarSection.sectionPaddingTop` | Space above a sidebar section's header. |
| `sidebarSection.sectionGap` | Gap between a section's disclosure chevron and its title. |
| `sidebarSection.sectionHeaderHeight` | Minimum height of a sidebar section's header. |

## `workspaceSwitcher`

| Token | What it is |
|---|---|
| `workspaceSwitcher.markerOffsetY` | How far down the rail item the active-workspace marker starts. |
| `workspaceSwitcher.markerWidth` | Width of the active-workspace marker on the rail's edge. |
| `workspaceSwitcher.markerRadius` | Radius of the marker's right corners. |
| `workspaceSwitcher.badgeOffsetY` | How far the unread badge sits above a workspace tile. |
| `workspaceSwitcher.badgeOffsetX` | How far the unread badge sits past a workspace tile's right edge. |

## `mobileHeader`

| Token | What it is |
|---|---|
| `mobileHeader.rowMinHeight` | Minimum height of the header's title row on the phone; the same number as size.row.default, but it is the header, not a list row. |
| `mobileHeader.largeTitleLineHeight` | Line height of the large title, 4 more than font.lineHeight.h1, so the 28 title breathes. |
| `mobileHeader.titleInset` | Space each side of the header's centred title that is left for the leading and trailing controls. |

## `tabBar`

| Token | What it is |
|---|---|
| `tabBar.badgeOffsetX` | How far in from a tab's left edge its badge sits. |
| `tabBar.labelLineHeight` | Line height of a tab's label, tighter than font.lineHeight.caption so two lines of icon and label fit. |
| `tabBar.labelMaxWidth` | Widest a tab's label grows before it truncates. |
| `tabBar.itemSizeSqueezed` | Side of a tab when the lens squeezes many tabs into the bar. |

## `commandPalette`

| Token | What it is |
|---|---|
| `commandPalette.slotSize` | Side of the cell that holds a result's avatar or icon. |
| `commandPalette.listMaxHeight` | Tallest the results list grows before it scrolls. |

## `contextMenu`

| Token | What it is |
|---|---|
| `contextMenu.emojiFontSize` | Font size of an emoji in the context menu's quick reactions on web and desktop; the phone uses font.size.lead. |
| `contextMenu.emojiGridFontSize` | Font size of the emoji grid in the phone's picker, with its letter spacing and line height taken from it. |
| `contextMenu.sceneOffsetX` | How far the demo scene pushes the menu in, to sit under the message it belongs to. |

## `dialog`

| Token | What it is |
|---|---|
| `dialog.bodyMaxHeight` | Tallest a dialog's body grows before it scrolls. |
| `dialog.actionMinWidth` | Narrowest a dialog's confirm and cancel buttons are, so the pair reads as a pair. |
| `dialog.bodyGap` | Space under the body text of the phone's dialog, before the buttons; off the space scale on purpose. |

## `hoverCard`

| Token | What it is |
|---|---|
| `hoverCard.headGap` | Gap between the person's avatar and their name in the hover card. |
| `hoverCard.guestHeight` | Height of the Guest chip beside a name in the hover card. |
| `hoverCard.guestPaddingX` | Side padding of the Guest chip. |
| `hoverCard.presenceDotSize` | Diameter of the presence dot in the hover card. |

## `tooltip`

| Token | What it is |
|---|---|
| `tooltip.kbdHeight` | Height of the key cap shown inside a tooltip, smaller than the standalone Kbd's 20. |
| `tooltip.kbdFontSize` | Font size of the key cap inside a tooltip. |

## `sessionState`

| Token | What it is |
|---|---|
| `sessionState.proseMaxWidth` | Widest the explanation under a session-state title grows before it wraps. |

## `updateBanner`

| Token | What it is |
|---|---|
| `updateBanner.dotInset` | How far in from the button's top right corner the status dot sits. |
| `updateBanner.versionTileSize` | Side of the version tile in the phone's update banner. |

## `questionPanel`

| Token | What it is |
|---|---|
| `questionPanel.keySize` | Box of the number key beside each answer row (1 to 9) on web and desktop. |
| `questionPanel.detailsMaxHeight` | Height of what Fabric says it will do before it scrolls inside the panel. |
| `questionPanel.elbowWidth` | Width of the hairline elbow joining the type-to-confirm field to its row. |
| `questionPanel.elbowHeight` | Height of the hairline elbow joining the type-to-confirm field to its row. |
| `questionPanel.elbowRadius` | Rounded corner of the type-to-confirm elbow. |
| `questionPanel.confirmInset` | How far the type-to-confirm field sits in under the row it guards. |
| `questionPanel.argsMaxHeight` | Height of a tool call's argument list before it scrolls: 240 on web and desktop. Values are never cut; the list scrolls. |
| `questionPanel.argKeyMinWidth` | Narrowest the argument names' column gets, so short names line their values up: 84 on web and desktop. |

## `thinkingIndicator`

| Token | What it is |
|---|---|
| `thinkingIndicator.cellSize` | One cell of the thinking mark's three-by-three lattice. |
| `thinkingIndicator.cellRadius` | Corner of a lattice cell, a quarter of the cell. |
| `thinkingIndicator.markWidth` | Column the thinking mark sits in, the message avatar's column less the head gap, so the answer's avatar lands where the mark was: 32 on web and desktop. |

## `agentSteps`

| Token | What it is |
|---|---|
| `agentSteps.markerSize` | Box of a step's state marker: the pulsing dot, the tick or the cross. |

## `chart`

| Token | What it is |
|---|---|
| `chart.gridDash` | Length of a dash in a chart's grid and crosshair. |
| `chart.referenceDash` | Length of a dash in a target or threshold line. |
| `chart.seriesDash` | Length of a dash in a series drawn dashed: a forecast, or the previous period. |
| `chart.endLabelWidth` | Room kept to the right of a horizontal bar chart for the value labels at the bars' ends, so the longest bar's label is not cut. |
| `chart.activeRingWidth` | Width of the ring in the card's colour round a hovered or pressed point, which lifts it off the line it sits on. A resting point's ring is border.width.thick. |
| `chart.stackGap` | Width of the card-coloured line between the segments of a stacked bar. |
| `chart.signedRadius` | Corner radius of every corner of a bar coloured by sign (gain or loss), so a bar below zero is rounded where it ends too. Smaller than barRadius. |
| `chart.edgeInset` | Space before the first point and after the last on the phone's line chart, so the end dots and the first label are not cut by the plot's edge. |
| `chart.plotMinWidth` | Narrowest plot the phone's charts draw, whatever the card is measured at while it lays out. |
| `chart.barMinWidth` | Narrowest a bar is drawn on the phone: past this many bars the gaps give way before the bars do. |
| `chart.labelBandHeight` | Height under the phone's plot that gifted-charts needs for its axis labels and the x axis: the plot is the chart's height minus this. |
| `chart.tipWidth` | Width the phone's chart reserves for the tooltip card while a finger is down, so the card is placed before it is drawn. |
| `chart.tipBaseHeight` | Height of a tooltip card with no rows: its padding and title. The phone adds tipRowH for each series to place the card. |
| `chart.tipRowHeight` | Height of one series row in a tooltip card, added to tipBaseH for the card's height. |
| `chart.sliceGap` | Width of the card-coloured line between a donut's segments on the phone, where gifted-charts cuts them apart with a stroke. The web's gap is an angle, in core's SLICE_GAP_DEG. |
| `chart.sliceRadius` | Corner radius of a donut's segments on the web, so each is a rounded piece and not a wedge. |
| `chart.sliceInset` | Room kept round a donut's ring: on the phone how far a pressed segment grows out, on the web the same air so the ring does not touch the card's edge. |
| `chart.gaugeCapRadius` | Corner radius at the ends of a gauge's fill on the web, so it has round ends. |
| `chart.tickWidth` | Width of the gauge's target tick. |
| `chart.tickOverhang` | How far the gauge's target tick reaches past the ring on each side, so it reads as a mark across the band and not a gap in it. |
| `chart.listMinWidth` | Narrowest the list beside GoalRings' rings gets before it drops under them: a label, a value and a share need this much. |
| `chart.splitHeight` | Height of Breakdown's one bar, split into its parts. |
| `chart.splitGap` | The card showing through between the parts of Breakdown's bar. |
| `chart.splitMinWidth` | Narrowest a part of Breakdown's bar is drawn, so a part that is a sliver of the whole still shows. |
| `chart.tabMinWidth` | Narrowest a MetricTabs tab is on the web and the desktop: a label and its total need this much. On the phone the tabs share the width. |
| `chart.ruleHeight` | Thickness of the rule under MetricTabs' selected tab, and of the line key beside a PeriodCompare total. |
| `chart.sideWidth` | Width of PeriodCompare's column of totals beside the chart, on the web and the desktop. On the phone the totals sit in a row above the chart. |
| `chart.keyWidth` | Length of the line key beside a PeriodCompare total: solid for this period, dashed for the last, as the chart draws them. |
| `chart.partMinWidth` | Narrowest a column of Breakdown's list or DonutChart's legend gets on the web and the desktop before the columns drop to fewer: a name, its value and its share need this much. On the phone the list is one column. |
| `chart.sparkWidth` | Stroke width of a sparkline, thinner than a chart's line because it is small. |
| `chart.barMaxWidth` | Widest a vertical bar grows, so a chart with few categories does not draw slabs. |
| `chart.previousWidth` | Stroke width of a series drawn dashed: the previous period's line in PeriodCompare, the line across ComboChart's bars. Thinner than a solid line (chart.lineWidth), so what it is compared with reads first. |

## `kpi`

| Token | What it is |
|---|---|
| `kpi.sparkBarRadius` | Corner radius of the free end of a SparkBars bar: small, because the bars are a few px wide. |
| `kpi.meterMinWidth` | Narrowest a Meter gets, so one with a short label is still a bar you can read the fill of. |
| `kpi.ringMinWidth` | Thinnest a ProgressRing's stroke gets: the stroke is a share of the ring's size, and a small ring keeps this much. |
| `kpi.cardTrendHeight` | Height of the trend bled into the foot of a KpiCard. |
| `kpi.tileTrendWidth` | Width of a StatTile's sparkline, at the end of its value row. The phone stretches it to the tile instead. |
| `kpi.tileBarsWidth` | Width of a StatTile's SparkBars, a little narrower than its sparkline so the bars sit on whole pixels. The phone stretches it to the tile instead. |
| `kpi.loadWidthSm` | Width of the shortest line in a KPI's loading state. |
| `kpi.loadWidthMd` | Width of a KPI's loading label line. |
| `kpi.loadWidthLg` | Width of a KPI's loading value line. |
| `kpi.loadWidthXl` | Width of the longest line in a KPI's loading state, where the note and the trend will be. |
| `kpi.loadLineHeight` | Height of a text line in a KPI's loading state. |
| `kpi.loadValueHeight` | Height of the value line in a KPI's loading state: the height of the number that replaces it. |
| `kpi.sparkBarMaxWidth` | Widest a SparkBars bar grows: thin, as the reference dashboard's KPI bars, and its own so a wider chart.barMaxWidth does not reach the KPI pieces. |
| `kpi.tileTrendHeight` | Height of a StatTile's sparkline or bars. |

## `table`

| Token | What it is |
|---|---|
| `table.checkWidth` | Width of the selection column, the header's box and each row's. |
| `table.sparkWidth` | Width of a sparkline cell's trend. |
| `table.sparkHeight` | Height of a sparkline cell's trend. |
| `table.loadWidthSm` | Width of the shortest line in a loading table's cells. |
| `table.loadWidthMd` | Width of the middle line in a loading table's cells. |
| `table.loadWidthLg` | Width of the longest line in a loading table's cells. The three repeat across a row and shift down a row, so a column never reads as one stamp. |
| `table.loadHeight` | Height of a line in a loading table's cells. |
| `table.loadCardWidthSm` | Width of the short line in a loading card on the phone, where the lines are the card's label and value. |
| `table.loadCardWidthLg` | Width of the long line in a loading card on the phone, where the title will be. |
| `table.cardsBreakpoint` | With `narrow="cards"` on web and desktop, the width of the table's own box under which it draws a card per row instead of the grid (measured, not the window). The phone always draws cards. |

## `switch`

| Token | What it is |
|---|---|
| `switch.thumbTravel` | How far the thumb slides between off and on: track width, minus padding on both sides, minus thumb. |

## `checkbox`

| Token | What it is |
|---|---|
| `checkbox.tickSize` | Size of the tick or dash drawn inside a checked or mixed checkbox: 9 on web and desktop. |
