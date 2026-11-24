# Token names for 2.0: proposed

Every token, with the name it would take under the category-first standard. Nothing here is applied yet: this table is for review.
Generated from `packages/core/tokens.json`; `tokens-2.json` beside it is the same data for the codemod.

**429 renamed · 82 keep their name · 159 internal, left as they are · 0 collisions**

## The rules

- A **semantic** token is `category.property.role`: `color.text.muted`, `size.control.md`, `font.size.body`.
- A **component** token is `componentId.partPropertyVariant`, one camelCase key in full words: `chip.removeSize`, `select.panelMaxHeight`, `chart.gridColor`.
  The group is the camelCase of the component's docs id, or a registered family several components share (`chart`, `kpi`, `choice`, `sheet`).
- The CSS variable is `--af-` plus the path in kebab case: `color.text.muted` is `--af-color-text-muted`.
- Old names keep working through 1.x as deprecated aliases and leave in 2.0.

## Open decisions

1. **Internal tokens** (`os`, `osBadge`, `osNotification`, `osTray`, `osMenu`, `osWindow`, `osHeader`: 159) are not renamed in this pass. They are not documented, so renaming them buys little. Say so if they should follow the grammar too.
2. **`statusbar.hAndroid`** carries a platform in its name. It becomes `size.layout.statusBarAndroid` for now; folding it into the Android value of `size.layout.statusBar` changes a value, so it is a separate change.
3. **Rows marked "chosen by hand"** had no property word in the old name (`dialog.icon`, `kpi.loadS`); the new name states one. Check them.
4. **Role words that change meaning**: `brand.active` → `…brand.pressed`, `border.active` → `color.border.selected`, `tabs.track` → `color.background.track`, `row.textGap` → `space.rowText`.

## `radius`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `radius.none` | (same) |  | semantic |  |
| `radius.tag` | (same) |  | semantic |  |
| `radius.row` | (same) |  | semantic |  |
| `radius.control` | (same) |  | semantic |  |
| `radius.input` | (same) |  | semantic |  |
| `radius.card` | (same) |  | semantic |  |
| `radius.rail` | (same) |  | semantic |  |
| `radius.panel` | (same) |  | semantic |  |
| `radius.sheet` | (same) |  | semantic |  |
| `radius.tray` | (same) |  | semantic |  |
| `radius.pill` | (same) |  | semantic |  |
| `radius.circle` | (same) |  | semantic |  |

## `border`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `border.wHairline` | `border.width.hairline` | `--af-border-width-hairline` | semantic |  |
| `border.wThick` | `border.width.thick` | `--af-border-width-thick` | semantic |  |
| `border.subtle` | `color.border.subtle` | `--af-color-border-subtle` | semantic |  |
| `border.muted` | `color.border.muted` | `--af-color-border-muted` | semantic |  |
| `border.default` | `color.border.default` | `--af-color-border-default` | semantic |  |
| `border.strong` | `color.border.strong` | `--af-color-border-strong` | semantic |  |
| `border.active` | `color.border.selected` | `--af-color-border-selected` | semantic | "active" is the focused, selected or filtered edge: the standard word is selected |
| `border.brand` | `color.border.brand` | `--af-color-border-brand` | semantic |  |
| `border.inverse` | `color.border.inverse` | `--af-color-border-inverse` | semantic |  |

## `space`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `space.none` | (same) |  | semantic |  |
| `space.3xs` | (same) |  | semantic |  |
| `space.2xs` | (same) |  | semantic |  |
| `space.xs` | (same) |  | semantic |  |
| `space.sm` | (same) |  | semantic |  |
| `space.smMd` | (same) |  | semantic |  |
| `space.md` | (same) |  | semantic |  |
| `space.mdLg` | (same) |  | semantic |  |
| `space.lg` | (same) |  | semantic |  |
| `space.lgXl` | (same) |  | semantic |  |
| `space.xl` | (same) |  | semantic |  |
| `space.2xl` | (same) |  | semantic |  |
| `space.3xl` | (same) |  | semantic |  |
| `space.4xl` | (same) |  | semantic |  |
| `space.5xl` | (same) |  | semantic |  |

## `dot`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `dot.sizeSm` | `size.dot.sm` | `--af-size-dot-sm` | semantic |  |
| `dot.size` | `size.dot.default` | `--af-size-dot-default` | semantic |  |

## `sheet`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `sheet.grabberW` | `sheet.grabberWidth` | `--af-sheet-grabber-width` | component |  |
| `sheet.grabberH` | `sheet.grabberHeight` | `--af-sheet-grabber-height` | component |  |
| `sheet.glassRadius` | (same) |  | component |  |
| `sheet.contentMin` | `sheet.contentMinHeight` | `--af-sheet-content-min-height` | component | chosen by hand: the old name had no property word |
| `sheet.titleLine` | `sheet.titleLineHeight` | `--af-sheet-title-line-height` | component |  |
| `sheet.w` | `sheet.width` | `--af-sheet-width` | component |  |

## `fab`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `fab.markSize` | (same) |  | component |  |
| `fab.size` | (same) |  | component |  |

## `iconButton`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `iconButton.badgeTop` | `iconButton.badgeOffsetY` | `--af-icon-button-badge-offset-y` | component |  |
| `iconButton.badgeRight` | `iconButton.badgeOffsetX` | `--af-icon-button-badge-offset-x` | component |  |

## `segmentedControl`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `segmentedControl.countSize` | (same) |  | component |  |
| `segmentedControl.cardInset` | (same) |  | component |  |
| `segmentedControl.h` | `segmentedControl.height` | `--af-segmented-control-height` | component |  |
| `segmentedControl.padX` | `segmentedControl.paddingX` | `--af-segmented-control-padding-x` | component |  |

## `choice`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `choice.pillGap` | (same) |  | component |  |
| `choice.ringW` | `choice.ringWidth` | `--af-choice-ring-width` | component |  |
| `choice.ringNudge` | `choice.ringOffsetY` | `--af-choice-ring-offset-y` | component |  |
| `choice.gap` | (same) |  | component |  |
| `choice.padY` | `choice.paddingY` | `--af-choice-padding-y` | component |  |
| `choice.ringSize` | (same) |  | component |  |
| `choice.dotSize` | (same) |  | component |  |

## `radioGroup`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `radioGroup.cardMinW` | `radioGroup.cardMinWidth` | `--af-radio-group-card-min-width` | component |  |

## `chip`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `chip.maxW` | `chip.maxWidth` | `--af-chip-max-width` | component |  |
| `chip.h` | `chip.height` | `--af-chip-height` | component |  |
| `chip.padX` | `chip.paddingX` | `--af-chip-padding-x` | component |  |
| `chip.removeSize` | (same) |  | component |  |

## `select`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `select.padLeftSm` | `select.paddingLeftSm` | `--af-select-padding-left-sm` | component |  |
| `select.chipH` | `select.chipHeight` | `--af-select-chip-height` | component |  |
| `select.chipPadLeft` | `select.chipPaddingLeft` | `--af-select-chip-padding-left` | component |  |
| `select.triggerGap` | (same) |  | component |  |
| `select.linkH` | `select.linkHeight` | `--af-select-link-height` | component |  |
| `select.linkPadX` | `select.linkPaddingX` | `--af-select-link-padding-x` | component |  |
| `select.panelMaxH` | `select.panelMaxHeight` | `--af-select-panel-max-height` | component |  |
| `select.panelMinW` | `select.panelMinWidth` | `--af-select-panel-min-width` | component |  |
| `select.panelPad` | `select.panelPadding` | `--af-select-panel-padding` | component |  |
| `select.dotGap` | (same) |  | component |  |

## `textField`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `textField.tagPadX` | `textField.tagPaddingX` | `--af-text-field-tag-padding-x` | component |  |
| `textField.trailingPull` | `textField.trailingOffsetX` | `--af-text-field-trailing-offset-x` | component |  |
| `textField.prefixPull` | `textField.prefixOffsetX` | `--af-text-field-prefix-offset-x` | component |  |

## `font`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `font.sans` | `font.family.sans` | `--af-font-family-sans` | semantic |  |
| `font.display` | `font.family.display` | `--af-font-family-display` | semantic |  |
| `font.accent` | `font.family.accent` | `--af-font-family-accent` | semantic |  |
| `font.mono` | `font.family.mono` | `--af-font-family-mono` | semantic |  |
| `font.weightNormal` | `font.weight.normal` | `--af-font-weight-normal` | semantic |  |
| `font.weightRegular` | `font.weight.regular` | `--af-font-weight-regular` | semantic |  |
| `font.weightMedium` | `font.weight.medium` | `--af-font-weight-medium` | semantic |  |
| `font.weightSemibold` | `font.weight.semibold` | `--af-font-weight-semibold` | semantic |  |
| `font.weightBold` | `font.weight.bold` | `--af-font-weight-bold` | semantic |  |
| `font.weightBlack` | `font.weight.black` | `--af-font-weight-black` | semantic |  |
| `font.fileSansRegular` | `font.file.sans.regular` | `--af-font-file-sans-regular` | semantic |  |
| `font.fileSansMedium` | `font.file.sans.medium` | `--af-font-file-sans-medium` | semantic |  |
| `font.fileSansSemibold` | `font.file.sans.semibold` | `--af-font-file-sans-semibold` | semantic |  |
| `font.fileSansBold` | `font.file.sans.bold` | `--af-font-file-sans-bold` | semantic |  |
| `font.fileSansExtrabold` | `font.file.sans.extrabold` | `--af-font-file-sans-extrabold` | semantic |  |
| `font.fileDisplayRegular` | `font.file.display.regular` | `--af-font-file-display-regular` | semantic |  |
| `font.fileDisplayMedium` | `font.file.display.medium` | `--af-font-file-display-medium` | semantic |  |
| `font.fileDisplaySemibold` | `font.file.display.semibold` | `--af-font-file-display-semibold` | semantic |  |
| `font.fileDisplayBold` | `font.file.display.bold` | `--af-font-file-display-bold` | semantic |  |
| `font.fileDisplayExtrabold` | `font.file.display.extrabold` | `--af-font-file-display-extrabold` | semantic |  |

## `tracking`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `tracking.tight` | `font.letterSpacing.tight` | `--af-font-letter-spacing-tight` | semantic |  |
| `tracking.normal` | `font.letterSpacing.normal` | `--af-font-letter-spacing-normal` | semantic |  |
| `tracking.caps` | `font.letterSpacing.caps` | `--af-font-letter-spacing-caps` | semantic |  |

## `duration`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `duration.fast` | `motion.duration.fast` | `--af-motion-duration-fast` | semantic |  |
| `duration.base` | `motion.duration.base` | `--af-motion-duration-base` | semantic |  |
| `duration.quick` | `motion.duration.quick` | `--af-motion-duration-quick` | semantic |  |
| `duration.slow` | `motion.duration.slow` | `--af-motion-duration-slow` | semantic |  |

## `ease`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `ease.standard` | `motion.easing.standard` | `--af-motion-easing-standard` | semantic |  |
| `ease.out` | `motion.easing.out` | `--af-motion-easing-out` | semantic |  |
| `ease.nudge` | `motion.easing.nudge` | `--af-motion-easing-nudge` | semantic |  |

## `z`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `z.sticky` | `zIndex.sticky` | `--af-z-index-sticky` | semantic |  |
| `z.rail` | `zIndex.rail` | `--af-z-index-rail` | semantic |  |
| `z.menu` | `zIndex.menu` | `--af-z-index-menu` | semantic |  |
| `z.popover` | `zIndex.popover` | `--af-z-index-popover` | semantic |  |
| `z.modal` | `zIndex.modal` | `--af-z-index-modal` | semantic |  |
| `z.toast` | `zIndex.toast` | `--af-z-index-toast` | semantic |  |
| `z.tooltip` | `zIndex.tooltip` | `--af-z-index-tooltip` | semantic |  |

## `opacity`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `opacity.disabled` | (same) |  | semantic |  |
| `opacity.muted` | (same) |  | semantic |  |
| `opacity.secondary` | (same) |  | semantic |  |

## `glass`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `glass.blur` | `effect.glass.blur` | `--af-effect-glass-blur` | semantic |  |
| `glass.saturate` | `effect.glass.saturate` | `--af-effect-glass-saturate` | semantic |  |
| `glass.bg` | `color.background.glass.default` | `--af-color-background-glass-default` | semantic |  |
| `glass.clear` | `color.background.glass.clear` | `--af-color-background-glass-clear` | semantic |  |
| `glass.tinted` | `color.background.glass.tinted` | `--af-color-background-glass-tinted` | semantic |  |
| `glass.solid` | `color.background.glass.solid` | `--af-color-background-glass-solid` | semantic |  |
| `glass.edge` | `color.border.glass` | `--af-color-border-glass` | semantic |  |

## `osBadge`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `osBadge.macDockRadius` | (same) |  | component | internal |
| `osBadge.macIconSize` | (same) |  | component | internal |
| `osBadge.macIconRadius` | (same) |  | component | internal |
| `osBadge.macRunDot` | (same) |  | component | internal |
| `osBadge.macHangY` | (same) |  | component | internal |
| `osBadge.macHangX` | (same) |  | component | internal |
| `osBadge.macSize` | (same) |  | component | internal |
| `osBadge.winButtonSize` | (same) |  | component | internal |
| `osBadge.winButtonRadius` | (same) |  | component | internal |
| `osBadge.winTaskbarH` | (same) |  | component | internal |
| `osBadge.winHangY` | (same) |  | component | internal |
| `osBadge.winHangX` | (same) |  | component | internal |
| `osBadge.winSize` | (same) |  | component | internal |
| `osBadge.winPadX` | (same) |  | component | internal |
| `osBadge.winDot` | (same) |  | component | internal |
| `osBadge.winLabel` | (same) |  | component | internal |
| `osBadge.winBarW` | (same) |  | component | internal |
| `osBadge.winBarH` | (same) |  | component | internal |
| `osBadge.linuxDockRadius` | (same) |  | component | internal |
| `osBadge.linuxHangY` | (same) |  | component | internal |
| `osBadge.linuxHangX` | (same) |  | component | internal |
| `osBadge.linuxMinW` | (same) |  | component | internal |
| `osBadge.linuxH` | (same) |  | component | internal |
| `osBadge.linuxPadX` | (same) |  | component | internal |
| `osBadge.linuxLabel` | (same) |  | component | internal |
| `osBadge.browserStripW` | (same) |  | component | internal |
| `osBadge.browserStripRadius` | (same) |  | component | internal |
| `osBadge.browserTabW` | (same) |  | component | internal |
| `osBadge.browserTabH` | (same) |  | component | internal |
| `osBadge.browserTabRadius` | (same) |  | component | internal |
| `osBadge.browserFavicon` | (same) |  | component | internal |
| `osBadge.browserFaviconRadius` | (same) |  | component | internal |
| `osBadge.browserFaviconLabel` | (same) |  | component | internal |
| `osBadge.browserHang` | (same) |  | component | internal |
| `osBadge.iosTilePadX` | (same) |  | component | internal |
| `osBadge.iosTilePadY` | (same) |  | component | internal |
| `osBadge.iosTileRadius` | (same) |  | component | internal |
| `osBadge.iosHangY` | (same) |  | component | internal |
| `osBadge.iosHangX` | (same) |  | component | internal |
| `osBadge.iosSize` | (same) |  | component | internal |
| `osBadge.iosPadX` | (same) |  | component | internal |
| `osBadge.iosLabel` | (same) |  | component | internal |
| `osBadge.androidDotInset` | (same) |  | component | internal |
| `osBadge.androidDot` | (same) |  | component | internal |

## `inAppBanner`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `inAppBanner.dismissInset` | (same) |  | component |  |
| `inAppBanner.w` | `inAppBanner.width` | `--af-in-app-banner-width` | component |  |

## `notificationItem`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `notificationItem.kindBadge` | `notificationItem.kindBadgeSize` | `--af-notification-item-kind-badge-size` | component | chosen by hand: the old name had no property word |
| `notificationItem.kindBadgeRadius` | (same) |  | component |  |
| `notificationItem.tile` | `notificationItem.tileSize` | `--af-notification-item-tile-size` | component | chosen by hand: the old name had no property word |
| `notificationItem.textGap` | (same) |  | component |  |
| `notificationItem.metaGap` | (same) |  | component |  |

## `icon`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `icon.strokeBold` | `size.stroke.bold` | `--af-size-stroke-bold` | semantic | an icon's line weight |
| `icon.strokeThin` | `size.stroke.thin` | `--af-size-stroke-thin` | semantic | an icon's line weight |
| `icon.sizeSm` | `size.icon.sm` | `--af-size-icon-sm` | semantic |  |
| `icon.sizeMd` | `size.icon.md` | `--af-size-icon-md` | semantic |  |
| `icon.size` | `size.icon.default` | `--af-size-icon-default` | semantic |  |
| `icon.sizeLg` | `size.icon.lg` | `--af-size-icon-lg` | semantic |  |
| `icon.stroke` | `size.stroke.default` | `--af-size-stroke-default` | semantic | an icon's line weight |
| `icon.strokeTick` | `size.stroke.tick` | `--af-size-stroke-tick` | semantic | an icon's line weight |

## `notificationSchedule`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `notificationSchedule.noteMaxW` | `notificationSchedule.noteMaxWidth` | `--af-notification-schedule-note-max-width` | component |  |
| `notificationSchedule.w` | `notificationSchedule.width` | `--af-notification-schedule-width` | component |  |

## `osNotification`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `osNotification.macRadius` | (same) |  | component | internal |
| `osNotification.winRadius` | (same) |  | component | internal |
| `osNotification.linuxRadius` | (same) |  | component | internal |
| `osNotification.browserRadius` | (same) |  | component | internal |
| `osNotification.macActionH` | (same) |  | component | internal |
| `osNotification.macActionRadius` | (same) |  | component | internal |
| `osNotification.linuxActionH` | (same) |  | component | internal |
| `osNotification.linuxActionRadius` | (same) |  | component | internal |
| `osNotification.browserActionH` | (same) |  | component | internal |
| `osNotification.controlRadius` | (same) |  | component | internal |
| `osNotification.iconSize` | (same) |  | component | internal |
| `osNotification.iconLabel` | (same) |  | component | internal |
| `osNotification.closeHang` | (same) |  | component | internal |
| `osNotification.fieldH` | (same) |  | component | internal |
| `osNotification.sendSize` | (same) |  | component | internal |
| `osNotification.winSendSize` | (same) |  | component | internal |
| `osNotification.badgeSize` | (same) |  | component | internal |
| `osNotification.badgeRadius` | (same) |  | component | internal |
| `osNotification.macIconSize` | (same) |  | component | internal |
| `osNotification.macIconLabel` | (same) |  | component | internal |
| `osNotification.appIconRadius` | (same) |  | component | internal |
| `osNotification.w` | (same) |  | component | internal |
| `osNotification.iosRadius` | (same) |  | component | internal |
| `osNotification.androidRadius` | (same) |  | component | internal |
| `osNotification.iosIconSize` | (same) |  | component | internal |
| `osNotification.androidIconSize` | (same) |  | component | internal |
| `osNotification.iosControlH` | (same) |  | component | internal |
| `osNotification.iosFieldRadius` | (same) |  | component | internal |
| `osNotification.androidFieldH` | (same) |  | component | internal |
| `osNotification.androidFieldRadius` | (same) |  | component | internal |
| `osNotification.iosActionRadius` | (same) |  | component | internal |
| `osNotification.iosMenuW` | (same) |  | component | internal |
| `osNotification.iosMenuRadius` | (same) |  | component | internal |
| `osNotification.iosHairline` | (same) |  | component | internal |
| `osNotification.iosBody` | (same) |  | component | internal |
| `osNotification.iosLine` | (same) |  | component | internal |
| `osNotification.iosHeader` | (same) |  | component | internal |
| `osNotification.iosTime` | (same) |  | component | internal |
| `osNotification.sliverH` | (same) |  | component | internal |
| `osNotification.sliverRadius` | (same) |  | component | internal |
| `osNotification.sliverFarH` | (same) |  | component | internal |
| `osNotification.sliverFarRadius` | (same) |  | component | internal |
| `osNotification.badgeEdge` | (same) |  | component | internal |

## `permissionPrompt`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `permissionPrompt.addressH` | `permissionPrompt.addressHeight` | `--af-permission-prompt-address-height` | component |  |
| `permissionPrompt.lock` | `permissionPrompt.lockSize` | `--af-permission-prompt-lock-size` | component | chosen by hand: the old name had no property word |
| `permissionPrompt.w` | `permissionPrompt.width` | `--af-permission-prompt-width` | component |  |
| `permissionPrompt.tile` | `permissionPrompt.tileSize` | `--af-permission-prompt-tile-size` | component | chosen by hand: the old name had no property word |

## `osTray`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `osTray.winRadius` | (same) |  | component | internal |
| `osTray.macRadius` | (same) |  | component | internal |
| `osTray.linuxRadius` | (same) |  | component | internal |
| `osTray.liquidRadius` | (same) |  | component | internal |
| `osTray.winRowH` | (same) |  | component | internal |
| `osTray.winRowRadius` | (same) |  | component | internal |
| `osTray.macRowH` | (same) |  | component | internal |
| `osTray.macRowRadius` | (same) |  | component | internal |
| `osTray.linuxRowH` | (same) |  | component | internal |
| `osTray.linuxRowRadius` | (same) |  | component | internal |
| `osTray.statusBarH` | (same) |  | component | internal |
| `osTray.statusBarRadius` | (same) |  | component | internal |
| `osTray.statusGap` | (same) |  | component | internal |
| `osTray.statusItemH` | (same) |  | component | internal |
| `osTray.statusItemRadius` | (same) |  | component | internal |
| `osTray.statusItemLiquidRadius` | (same) |  | component | internal |
| `osTray.submenuTop` | (same) |  | component | internal |
| `osTray.sheetW` | (same) |  | component | internal |
| `osTray.winTaskbarH` | (same) |  | component | internal |
| `osTray.winTaskbarRadius` | (same) |  | component | internal |
| `osTray.linuxBarH` | (same) |  | component | internal |
| `osTray.glyph` | (same) |  | component | internal |
| `osTray.glyphRadius` | (same) |  | component | internal |

## `breadcrumbs`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `breadcrumbs.recordingGap` | (same) |  | component |  |
| `breadcrumbs.recordingDot` | `breadcrumbs.recordingDotSize` | `--af-breadcrumbs-recording-dot-size` | component | chosen by hand: the old name had no property word |
| `breadcrumbs.crumbMaxW` | `breadcrumbs.crumbMaxWidth` | `--af-breadcrumbs-crumb-max-width` | component |  |

## `osWindow`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `osWindow.macLight` | (same) |  | component | internal |
| `osWindow.macLightsInset` | (same) |  | component | internal |
| `osWindow.macLightsW` | (same) |  | component | internal |
| `osWindow.winCaptionW` | (same) |  | component | internal |
| `osWindow.linuxCaption` | (same) |  | component | internal |

## `tab`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `tab.indicatorRadius` | `tabs.indicatorRadius` | `--af-tabs-indicator-radius` | component |  |
| `tab.countSize` | `tabs.countSize` | `--af-tabs-count-size` | component |  |

## `osMenu`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `osMenu.macItemH` | (same) |  | component | internal |
| `osMenu.linuxItemH` | (same) |  | component | internal |
| `osMenu.macBarH` | (same) |  | component | internal |
| `osMenu.macTitleH` | (same) |  | component | internal |
| `osMenu.macTitlePadX` | (same) |  | component | internal |
| `osMenu.macDropTop` | (same) |  | component | internal |
| `osMenu.macDropW` | (same) |  | component | internal |
| `osMenu.macDropPad` | (same) |  | component | internal |
| `osMenu.macDropRadius` | (same) |  | component | internal |
| `osMenu.macGlassRadius` | (same) |  | component | internal |
| `osMenu.winDropW` | (same) |  | component | internal |
| `osMenu.winRadius` | (same) |  | component | internal |
| `osMenu.linuxDropW` | (same) |  | component | internal |
| `osMenu.winFlyoutTop` | (same) |  | component | internal |
| `osMenu.winFlyoutLeft` | (same) |  | component | internal |
| `osMenu.winFlyoutW` | (same) |  | component | internal |
| `osMenu.browserMenuW` | (same) |  | component | internal |

## `navRail`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `navRail.item` | `navRail.itemSize` | `--af-nav-rail-item-size` | component | chosen by hand: the old name had no property word |
| `navRail.badgeTop` | `navRail.badgeOffsetY` | `--af-nav-rail-badge-offset-y` | component |  |
| `navRail.badgeLeft` | `navRail.badgeOffsetX` | `--af-nav-rail-badge-offset-x` | component |  |
| `navRail.wOpen` | `navRail.widthOpen` | `--af-nav-rail-width-open` | component |  |
| `navRail.logo` | `navRail.logoSize` | `--af-nav-rail-logo-size` | component | chosen by hand: the old name had no property word |
| `navRail.logoRadius` | (same) |  | component |  |
| `navRail.logoGlyph` | `navRail.logoFontSize` | `--af-nav-rail-logo-font-size` | component | chosen by hand: the old name had no property word |
| `navRail.chipH` | `navRail.chipHeight` | `--af-nav-rail-chip-height` | component |  |

## `sidebar`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `sidebar.hashW` | `sidebarSection.hashWidth` | `--af-sidebar-section-hash-width` | component |  |
| `sidebar.sectionPadTop` | `sidebarSection.sectionPaddingTop` | `--af-sidebar-section-section-padding-top` | component |  |
| `sidebar.sectionGap` | `sidebarSection.sectionGap` | `--af-sidebar-section-section-gap` | component |  |
| `sidebar.sectionHeaderH` | `sidebarSection.sectionHeaderHeight` | `--af-sidebar-section-section-header-height` | component |  |

## `topbar`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `topbar.searchMaxW` | `size.layout.topBarSearchMax` | `--af-size-layout-top-bar-search-max` | semantic |  |
| `topbar.h` | `size.layout.topBar` | `--af-size-layout-top-bar` | semantic |  |
| `topbar.searchMinW` | `size.layout.topBarSearchMin` | `--af-size-layout-top-bar-search-min` | semantic |  |

## `workspace`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `workspace.markerTop` | `workspaceSwitcher.markerOffsetY` | `--af-workspace-switcher-marker-offset-y` | component |  |
| `workspace.markerW` | `workspaceSwitcher.markerWidth` | `--af-workspace-switcher-marker-width` | component |  |
| `workspace.markerRadius` | `workspaceSwitcher.markerRadius` | `--af-workspace-switcher-marker-radius` | component |  |
| `workspace.badgeTop` | `workspaceSwitcher.badgeOffsetY` | `--af-workspace-switcher-badge-offset-y` | component |  |
| `workspace.badgeRight` | `workspaceSwitcher.badgeOffsetX` | `--af-workspace-switcher-badge-offset-x` | component |  |
| `workspace.tileRadius` | `workspaceSwitcher.tileRadius` | `--af-workspace-switcher-tile-radius` | component |  |
| `workspace.menuW` | `workspaceSwitcher.menuWidth` | `--af-workspace-switcher-menu-width` | component |  |
| `workspace.tileEdge` | `workspaceSwitcher.tileRingWidth` | `--af-workspace-switcher-tile-ring-width` | component | chosen by hand: the old name had no property word |
| `workspace.menuRowH` | `workspaceSwitcher.menuRowHeight` | `--af-workspace-switcher-menu-row-height` | component |  |

## `osHeader`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `osHeader.islandTop` | (same) |  | component | internal |
| `osHeader.islandW` | (same) |  | component | internal |
| `osHeader.islandH` | (same) |  | component | internal |
| `osHeader.punchTop` | (same) |  | component | internal |
| `osHeader.punchSize` | (same) |  | component | internal |
| `osHeader.androidNavH` | (same) |  | component | internal |
| `osHeader.iosHomeBarW` | (same) |  | component | internal |
| `osHeader.iosHomeBarH` | (same) |  | component | internal |
| `osHeader.androidHomeBarW` | (same) |  | component | internal |
| `osHeader.androidHomeBarH` | (same) |  | component | internal |

## `mobileHeader`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `mobileHeader.rowMinH` | `mobileHeader.rowMinHeight` | `--af-mobile-header-row-min-height` | component |  |
| `mobileHeader.largeTitleLine` | `mobileHeader.largeTitleLineHeight` | `--af-mobile-header-large-title-line-height` | component |  |
| `mobileHeader.titleInset` | (same) |  | component |  |

## `tabBar`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `tabBar.itemH` | `tabBar.itemHeight` | `--af-tab-bar-item-height` | component |  |
| `tabBar.badgeX` | `tabBar.badgeOffsetX` | `--af-tab-bar-badge-offset-x` | component | chosen by hand: the old name had no property word |
| `tabBar.labelLine` | `tabBar.labelLineHeight` | `--af-tab-bar-label-line-height` | component |  |
| `tabBar.labelMaxW` | `tabBar.labelMaxWidth` | `--af-tab-bar-label-max-width` | component |  |
| `tabBar.itemSqueezed` | `tabBar.itemSizeSqueezed` | `--af-tab-bar-item-size-squeezed` | component | chosen by hand: the old name had no property word |

## `palette`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `palette.optionPadX` | `commandPalette.optionPaddingX` | `--af-command-palette-option-padding-x` | component |  |
| `palette.slot` | `commandPalette.slotSize` | `--af-command-palette-slot-size` | component | chosen by hand: the old name had no property word |
| `palette.w` | `commandPalette.width` | `--af-command-palette-width` | component |  |
| `palette.fieldPadY` | `commandPalette.fieldPaddingY` | `--af-command-palette-field-padding-y` | component |  |
| `palette.listMaxH` | `commandPalette.listMaxHeight` | `--af-command-palette-list-max-height` | component |  |

## `menu`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `menu.wContext` | `menu.widthContext` | `--af-menu-width-context` | component |  |
| `menu.w` | `menu.width` | `--af-menu-width` | component |  |
| `menu.rowHCoarse` | `menu.rowHeightCoarse` | `--af-menu-row-height-coarse` | component |  |

## `row`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `row.textGap` | `space.rowText` | `--af-space-row-text` | semantic | a gap, so it is a space |
| `row.h` | `size.row.default` | `--af-size-row-default` | semantic |  |
| `row.hLg` | `size.row.lg` | `--af-size-row-lg` | semantic |  |

## `emoji`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `emoji.size` | `contextMenu.emojiFontSize` | `--af-context-menu-emoji-font-size` | component |  |
| `emoji.grid` | `contextMenu.emojiGridFontSize` | `--af-context-menu-emoji-grid-font-size` | component |  |

## `contextMenu`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `contextMenu.sceneOffset` | `contextMenu.sceneOffsetX` | `--af-context-menu-scene-offset-x` | component | chosen by hand: the old name had no property word |

## `dialog`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `dialog.w` | `dialog.width` | `--af-dialog-width` | component |  |
| `dialog.wForm` | `dialog.widthForm` | `--af-dialog-width-form` | component |  |
| `dialog.icon` | `dialog.iconSize` | `--af-dialog-icon-size` | component | chosen by hand: the old name had no property word |
| `dialog.bodyMaxH` | `dialog.bodyMaxHeight` | `--af-dialog-body-max-height` | component |  |
| `dialog.actionMinW` | `dialog.actionMinWidth` | `--af-dialog-action-min-width` | component |  |
| `dialog.bodyGap` | (same) |  | component |  |

## `hoverCard`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `hoverCard.w` | `hoverCard.width` | `--af-hover-card-width` | component |  |
| `hoverCard.headGap` | (same) |  | component |  |
| `hoverCard.avatar` | `hoverCard.avatarSize` | `--af-hover-card-avatar-size` | component | chosen by hand: the old name had no property word |
| `hoverCard.guestH` | `hoverCard.guestHeight` | `--af-hover-card-guest-height` | component |  |
| `hoverCard.guestPadX` | `hoverCard.guestPaddingX` | `--af-hover-card-guest-padding-x` | component |  |
| `hoverCard.presenceDot` | `hoverCard.presenceDotSize` | `--af-hover-card-presence-dot-size` | component | chosen by hand: the old name had no property word |

## `tooltip`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `tooltip.maxW` | `tooltip.maxWidth` | `--af-tooltip-max-width` | component |  |
| `tooltip.padY` | `tooltip.paddingY` | `--af-tooltip-padding-y` | component |  |
| `tooltip.padX` | `tooltip.paddingX` | `--af-tooltip-padding-x` | component |  |
| `tooltip.kbdH` | `tooltip.kbdHeight` | `--af-tooltip-kbd-height` | component |  |
| `tooltip.kbdLabel` | `tooltip.kbdFontSize` | `--af-tooltip-kbd-font-size` | component | chosen by hand: the old name had no property word |

## `connectionBanner`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `connectionBanner.actionH` | `connectionBanner.actionHeight` | `--af-connection-banner-action-height` | component |  |
| `connectionBanner.padY` | `connectionBanner.paddingY` | `--af-connection-banner-padding-y` | component |  |

## `sessionState`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `sessionState.proseMaxW` | `sessionState.proseMaxWidth` | `--af-session-state-prose-max-width` | component |  |
| `sessionState.w` | `sessionState.width` | `--af-session-state-width` | component |  |
| `sessionState.tile` | `sessionState.tileSize` | `--af-session-state-tile-size` | component | chosen by hand: the old name had no property word |

## `updateBanner`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `updateBanner.cardPadY` | `updateBanner.cardPaddingY` | `--af-update-banner-card-padding-y` | component |  |
| `updateBanner.cardPadX` | `updateBanner.cardPaddingX` | `--af-update-banner-card-padding-x` | component |  |
| `updateBanner.button` | `updateBanner.buttonSize` | `--af-update-banner-button-size` | component | chosen by hand: the old name had no property word |
| `updateBanner.dotInset` | (same) |  | component |  |
| `updateBanner.bannerW` | `updateBanner.bannerWidth` | `--af-update-banner-banner-width` | component |  |
| `updateBanner.cardW` | `updateBanner.cardWidth` | `--af-update-banner-card-width` | component |  |
| `updateBanner.versionTile` | `updateBanner.versionTileSize` | `--af-update-banner-version-tile-size` | component | chosen by hand: the old name had no property word |

## `questionPanel`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `questionPanel.maxW` | `questionPanel.maxWidth` | `--af-question-panel-max-width` | component |  |
| `questionPanel.keySize` | (same) |  | component |  |
| `questionPanel.detailsMaxH` | `questionPanel.detailsMaxHeight` | `--af-question-panel-details-max-height` | component |  |
| `questionPanel.elbowW` | `questionPanel.elbowWidth` | `--af-question-panel-elbow-width` | component |  |
| `questionPanel.elbowH` | `questionPanel.elbowHeight` | `--af-question-panel-elbow-height` | component |  |
| `questionPanel.elbowRadius` | (same) |  | component |  |
| `questionPanel.confirmInset` | (same) |  | component |  |
| `questionPanel.argsMaxH` | `questionPanel.argsMaxHeight` | `--af-question-panel-args-max-height` | component |  |
| `questionPanel.argKeyMinW` | `questionPanel.argKeyMinWidth` | `--af-question-panel-arg-key-min-width` | component |  |

## `thinking`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `thinking.cell` | `thinkingIndicator.cellSize` | `--af-thinking-indicator-cell-size` | component | chosen by hand: the old name had no property word |
| `thinking.cellRadius` | `thinkingIndicator.cellRadius` | `--af-thinking-indicator-cell-radius` | component |  |
| `thinking.maxW` | `thinkingIndicator.maxWidth` | `--af-thinking-indicator-max-width` | component |  |
| `thinking.markW` | `thinkingIndicator.markWidth` | `--af-thinking-indicator-mark-width` | component |  |

## `agentSteps`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `agentSteps.marker` | `agentSteps.markerSize` | `--af-agent-steps-marker-size` | component | chosen by hand: the old name had no property word |
| `agentSteps.icon` | `agentSteps.iconSize` | `--af-agent-steps-icon-size` | component | chosen by hand: the old name had no property word |

## `phone`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `phone.cardW` | `size.layout.phoneCard` | `--af-size-layout-phone-card` | semantic |  |

## `chart`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `chart.font` | `chart.fontFamily` | `--af-chart-font-family` | component |  |
| `chart.gridDash` | (same) |  | component |  |
| `chart.gridGap` | (same) |  | component |  |
| `chart.referenceDash` | (same) |  | component |  |
| `chart.referenceGap` | (same) |  | component |  |
| `chart.seriesDash` | (same) |  | component |  |
| `chart.seriesGap` | (same) |  | component |  |
| `chart.axisH` | `chart.axisHeight` | `--af-chart-axis-height` | component |  |
| `chart.endLabelRoom` | `chart.endLabelWidth` | `--af-chart-end-label-width` | component | chosen by hand: the old name had no property word |
| `chart.activeRing` | `chart.activeRingWidth` | `--af-chart-active-ring-width` | component | chosen by hand: the old name had no property word |
| `chart.stackGap` | (same) |  | component |  |
| `chart.signedRadius` | (same) |  | component |  |
| `chart.edge` | `chart.edgeInset` | `--af-chart-edge-inset` | component | chosen by hand: the old name had no property word |
| `chart.plotMinW` | `chart.plotMinWidth` | `--af-chart-plot-min-width` | component |  |
| `chart.barMinW` | `chart.barMinWidth` | `--af-chart-bar-min-width` | component |  |
| `chart.labelBand` | `chart.labelBandHeight` | `--af-chart-label-band-height` | component | chosen by hand: the old name had no property word |
| `chart.tipW` | `chart.tipWidth` | `--af-chart-tip-width` | component |  |
| `chart.tipBaseH` | `chart.tipBaseHeight` | `--af-chart-tip-base-height` | component |  |
| `chart.tipRowH` | `chart.tipRowHeight` | `--af-chart-tip-row-height` | component |  |
| `chart.donutSize` | (same) |  | component |  |
| `chart.sliceGap` | (same) |  | component |  |
| `chart.sliceRadius` | (same) |  | component |  |
| `chart.sliceLift` | `chart.sliceInset` | `--af-chart-slice-inset` | component | chosen by hand: the old name had no property word |
| `chart.gaugeCap` | `chart.gaugeCapRadius` | `--af-chart-gauge-cap-radius` | component | chosen by hand: the old name had no property word |
| `chart.tickW` | `chart.tickWidth` | `--af-chart-tick-width` | component |  |
| `chart.tickOver` | `chart.tickOverhang` | `--af-chart-tick-overhang` | component | chosen by hand: the old name had no property word |
| `chart.listMinW` | `chart.listMinWidth` | `--af-chart-list-min-width` | component |  |
| `chart.ringGap` | (same) |  | component |  |
| `chart.splitH` | `chart.splitHeight` | `--af-chart-split-height` | component |  |
| `chart.splitGap` | (same) |  | component |  |
| `chart.splitMinW` | `chart.splitMinWidth` | `--af-chart-split-min-width` | component |  |
| `chart.tabMinW` | `chart.tabMinWidth` | `--af-chart-tab-min-width` | component |  |
| `chart.ruleH` | `chart.ruleHeight` | `--af-chart-rule-height` | component |  |
| `chart.sideW` | `chart.sideWidth` | `--af-chart-side-width` | component |  |
| `chart.keyW` | `chart.keyWidth` | `--af-chart-key-width` | component |  |
| `chart.partMinW` | `chart.partMinWidth` | `--af-chart-part-min-width` | component |  |
| `chart.series1` | `chart.series1Color` | `--af-chart-series1-color` | component |  |
| `chart.series2` | `chart.series2Color` | `--af-chart-series2-color` | component |  |
| `chart.series3` | `chart.series3Color` | `--af-chart-series3-color` | component |  |
| `chart.series4` | `chart.series4Color` | `--af-chart-series4-color` | component |  |
| `chart.series5` | `chart.series5Color` | `--af-chart-series5-color` | component |  |
| `chart.series6` | `chart.series6Color` | `--af-chart-series6-color` | component |  |
| `chart.series7` | `chart.series7Color` | `--af-chart-series7-color` | component |  |
| `chart.series8` | `chart.series8Color` | `--af-chart-series8-color` | component |  |
| `chart.previous` | `chart.previousColor` | `--af-chart-previous-color` | component |  |
| `chart.other` | `chart.otherColor` | `--af-chart-other-color` | component |  |
| `chart.grid` | `chart.gridColor` | `--af-chart-grid-color` | component |  |
| `chart.axis` | `chart.axisColor` | `--af-chart-axis-color` | component |  |
| `chart.label` | `chart.labelColor` | `--af-chart-label-color` | component |  |
| `chart.crosshair` | `chart.crosshairColor` | `--af-chart-crosshair-color` | component |  |
| `chart.reference` | `chart.referenceColor` | `--af-chart-reference-color` | component |  |
| `chart.tooltip` | `chart.tooltipColor` | `--af-chart-tooltip-color` | component |  |
| `chart.tooltipText` | `chart.tooltipTextColor` | `--af-chart-tooltip-text-color` | component |  |
| `chart.tooltipMuted` | `chart.tooltipMutedColor` | `--af-chart-tooltip-muted-color` | component |  |
| `chart.tooltipRule` | `chart.tooltipRuleColor` | `--af-chart-tooltip-rule-color` | component |  |
| `chart.track` | `chart.trackColor` | `--af-chart-track-color` | component |  |
| `chart.labelSize` | (same) |  | component |  |
| `chart.lineW` | `chart.lineWidth` | `--af-chart-line-width` | component |  |
| `chart.sparkW` | `chart.sparkWidth` | `--af-chart-spark-width` | component |  |
| `chart.pointR` | `chart.pointRadius` | `--af-chart-point-radius` | component | chosen by hand: the old name had no property word |
| `chart.barMaxW` | `chart.barMaxWidth` | `--af-chart-bar-max-width` | component |  |
| `chart.barSoloW` | `chart.barSoloWidth` | `--af-chart-bar-solo-width` | component |  |
| `chart.barH` | `chart.barHeight` | `--af-chart-bar-height` | component |  |
| `chart.barRadius` | (same) |  | component |  |
| `chart.barGap` | (same) |  | component |  |
| `chart.gaugeW` | `chart.gaugeWidth` | `--af-chart-gauge-width` | component |  |
| `chart.ringSize` | (same) |  | component |  |
| `chart.ringW` | `chart.ringWidth` | `--af-chart-ring-width` | component |  |
| `chart.previousW` | `chart.previousWidth` | `--af-chart-previous-width` | component |  |
| `chart.fileRegular` | `chart.fontFileRegular` | `--af-chart-font-file-regular` | component |  |
| `chart.fileMedium` | `chart.fontFileMedium` | `--af-chart-font-file-medium` | component |  |
| `chart.fileSemibold` | `chart.fontFileSemibold` | `--af-chart-font-file-semibold` | component |  |
| `chart.fileBold` | `chart.fontFileBold` | `--af-chart-font-file-bold` | component |  |

## `kpi`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `kpi.sparkBarRadius` | (same) |  | component |  |
| `kpi.meterH` | `kpi.meterHeight` | `--af-kpi-meter-height` | component |  |
| `kpi.meterCompactW` | `kpi.meterCompactWidth` | `--af-kpi-meter-compact-width` | component |  |
| `kpi.meterMinW` | `kpi.meterMinWidth` | `--af-kpi-meter-min-width` | component |  |
| `kpi.chipSize` | (same) |  | component |  |
| `kpi.ringMinW` | `kpi.ringMinWidth` | `--af-kpi-ring-min-width` | component |  |
| `kpi.cardTrendH` | `kpi.cardTrendHeight` | `--af-kpi-card-trend-height` | component |  |
| `kpi.tileTrendW` | `kpi.tileTrendWidth` | `--af-kpi-tile-trend-width` | component |  |
| `kpi.tileBarsW` | `kpi.tileBarsWidth` | `--af-kpi-tile-bars-width` | component |  |
| `kpi.loadS` | `kpi.loadWidthSm` | `--af-kpi-load-width-sm` | component | chosen by hand: the old name had no property word |
| `kpi.loadM` | `kpi.loadWidthMd` | `--af-kpi-load-width-md` | component | chosen by hand: the old name had no property word |
| `kpi.loadL` | `kpi.loadWidthLg` | `--af-kpi-load-width-lg` | component | chosen by hand: the old name had no property word |
| `kpi.loadXl` | `kpi.loadWidthXl` | `--af-kpi-load-width-xl` | component | chosen by hand: the old name had no property word |
| `kpi.loadLineH` | `kpi.loadLineHeight` | `--af-kpi-load-line-height` | component |  |
| `kpi.loadValueH` | `kpi.loadValueHeight` | `--af-kpi-load-value-height` | component |  |
| `kpi.sparkBarMaxW` | `kpi.sparkBarMaxWidth` | `--af-kpi-spark-bar-max-width` | component |  |
| `kpi.ringSize` | (same) |  | component |  |
| `kpi.tileTrendH` | `kpi.tileTrendHeight` | `--af-kpi-tile-trend-height` | component |  |

## `table`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `table.cellX` | `table.cellPaddingX` | `--af-table-cell-padding-x` | component |  |
| `table.headH` | `table.headHeight` | `--af-table-head-height` | component |  |
| `table.headRadius` | (same) |  | component |  |
| `table.denseRowH` | `table.denseRowHeight` | `--af-table-dense-row-height` | component |  |
| `table.checkW` | `table.checkWidth` | `--af-table-check-width` | component |  |
| `table.sparkW` | `table.sparkWidth` | `--af-table-spark-width` | component |  |
| `table.sparkH` | `table.sparkHeight` | `--af-table-spark-height` | component |  |
| `table.loadS` | `table.loadWidthSm` | `--af-table-load-width-sm` | component | chosen by hand: the old name had no property word |
| `table.loadM` | `table.loadWidthMd` | `--af-table-load-width-md` | component | chosen by hand: the old name had no property word |
| `table.loadL` | `table.loadWidthLg` | `--af-table-load-width-lg` | component | chosen by hand: the old name had no property word |
| `table.loadH` | `table.loadHeight` | `--af-table-load-height` | component |  |
| `table.loadCardS` | `table.loadCardWidthSm` | `--af-table-load-card-width-sm` | component | chosen by hand: the old name had no property word |
| `table.loadCardL` | `table.loadCardWidthLg` | `--af-table-load-card-width-lg` | component | chosen by hand: the old name had no property word |
| `table.cardsBelow` | `table.cardsBreakpoint` | `--af-table-cards-breakpoint` | component | chosen by hand: the old name had no property word |
| `table.header` | `table.headerColor` | `--af-table-header-color` | component |  |
| `table.rowHover` | `table.rowHoverColor` | `--af-table-row-hover-color` | component |  |
| `table.rowSelected` | `table.rowSelectedColor` | `--af-table-row-selected-color` | component |  |
| `table.divider` | `table.dividerColor` | `--af-table-divider-color` | component |  |
| `table.rowH` | `table.rowHeight` | `--af-table-row-height` | component |  |

## `surface`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `surface.page` | `color.background.page` | `--af-color-background-page` | semantic |  |
| `surface.card` | `color.background.card` | `--af-color-background-card` | semantic |  |
| `surface.raised` | `color.background.raised` | `--af-color-background-raised` | semantic |  |
| `surface.chrome` | `color.background.chrome` | `--af-color-background-chrome` | semantic |  |
| `surface.sidebar` | `color.background.sidebar` | `--af-color-background-sidebar` | semantic |  |
| `surface.recessed` | `color.background.recessed` | `--af-color-background-recessed` | semantic |  |
| `surface.muted` | `color.background.muted` | `--af-color-background-muted` | semantic |  |
| `surface.selected` | `color.background.selected` | `--af-color-background-selected` | semantic |  |
| `surface.unread` | `color.background.unread` | `--af-color-background-unread` | semantic |  |
| `surface.inverse` | `color.background.inverse` | `--af-color-background-inverse` | semantic |  |
| `surface.inverseHover` | `color.background.inverseHover` | `--af-color-background-inverse-hover` | semantic |  |
| `surface.inverseWash` | `color.background.inverseWash` | `--af-color-background-inverse-wash` | semantic |  |
| `surface.app` | `color.background.app` | `--af-color-background-app` | semantic |  |
| `surface.overlay` | `color.background.overlay` | `--af-color-background-overlay` | semantic |  |

## `brand`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `brand.tint` | `color.background.brand.tint` | `--af-color-background-brand-tint` | semantic |  |
| `brand.default` | `color.background.brand.default` | `--af-color-background-brand-default` | semantic |  |
| `brand.hover` | `color.background.brand.hover` | `--af-color-background-brand-hover` | semantic |  |
| `brand.active` | `color.background.brand.pressed` | `--af-color-background-brand-pressed` | semantic | "active" is the pressed fill |
| `brand.soft` | `color.background.brand.soft` | `--af-color-background-brand-soft` | semantic |  |
| `brand.softHover` | `color.background.brand.softHover` | `--af-color-background-brand-soft-hover` | semantic |  |

## `accent`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `accent.default` | `color.background.accent.default` | `--af-color-background-accent-default` | semantic |  |
| `accent.soft` | `color.background.accent.soft` | `--af-color-background-accent-soft` | semantic |  |

## `presence`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `presence.active` | `color.background.presence.active` | `--af-color-background-presence-active` | semantic |  |
| `presence.away` | `color.background.presence.away` | `--af-color-background-presence-away` | semantic |  |
| `presence.offline` | `color.background.presence.offline` | `--af-color-background-presence-offline` | semantic |  |
| `presence.dnd` | `color.background.presence.dnd` | `--af-color-background-presence-dnd` | semantic |  |

## `switch`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `switch.trackOff` | `switch.trackOffColor` | `--af-switch-track-off-color` | component |  |
| `switch.thumb` | `switch.thumbColor` | `--af-switch-thumb-color` | component |  |
| `switch.trackW` | `switch.trackWidth` | `--af-switch-track-width` | component |  |
| `switch.trackH` | `switch.trackHeight` | `--af-switch-track-height` | component |  |
| `switch.trackPad` | `switch.trackPadding` | `--af-switch-track-padding` | component |  |
| `switch.thumbSize` | (same) |  | component |  |
| `switch.thumbTravel` | (same) |  | component |  |
| `switch.thumbShadow` | (same) |  | component |  |

## `os`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `os.macClose` | (same) |  | semantic | internal |
| `os.macMin` | (same) |  | semantic | internal |
| `os.macMax` | (same) |  | semantic | internal |
| `os.notificationBg` | (same) |  | semantic | internal |
| `os.notificationFg` | (same) |  | semantic | internal |
| `os.browserChrome` | (same) |  | semantic | internal |
| `os.winClose` | (same) |  | semantic | internal |
| `os.badge` | (same) |  | semantic | internal |
| `os.macAccent` | (same) |  | semantic | internal |
| `os.island` | (same) |  | semantic | internal |
| `os.browserTab` | (same) |  | semantic | internal |
| `os.statusFg` | (same) |  | semantic | internal |
| `os.wallpaper` | (same) |  | semantic | internal |
| `os.iosLabelShadow` | (same) |  | semantic | internal |
| `os.macLightEdge` | (same) |  | semantic | internal |
| `os.winClosePressed` | (same) |  | semantic | internal |
| `os.onFill` | (same) |  | semantic | internal |

## `success`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `success.default` | `color.text.success` | `--af-color-text-success` | semantic | the role is text, icons and progress |
| `success.soft` | `color.background.success.soft` | `--af-color-background-success-soft` | semantic |  |

## `warning`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `warning.default` | `color.text.warning` | `--af-color-text-warning` | semantic | the role is text, icons and progress |
| `warning.soft` | `color.background.warning.soft` | `--af-color-background-warning-soft` | semantic |  |

## `banner`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `banner.warningBorder` | `color.border.warning` | `--af-color-border-warning` | semantic |  |

## `danger`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `danger.default` | `color.text.danger` | `--af-color-text-danger` | semantic |  |
| `danger.soft` | `color.background.danger.soft` | `--af-color-background-danger-soft` | semantic |  |
| `danger.hover` | `color.text.dangerHover` | `--af-color-text-danger-hover` | semantic |  |
| `danger.solid` | `color.background.danger.default` | `--af-color-background-danger-default` | semantic |  |
| `danger.solidHover` | `color.background.danger.hover` | `--af-color-background-danger-hover` | semantic |  |
| `danger.fg` | `color.text.onDanger` | `--af-color-text-on-danger` | semantic |  |

## `info`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `info.default` | `color.text.info` | `--af-color-text-info` | semantic | the role is text, icons and progress |
| `info.soft` | `color.background.info.soft` | `--af-color-background-info-soft` | semantic |  |

## `tag`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `tag.neutralBg` | `color.background.tag.neutral` | `--af-color-background-tag-neutral` | semantic |  |
| `tag.neutralFg` | `color.text.tag.neutral` | `--af-color-text-tag-neutral` | semantic |  |
| `tag.brandBg` | `color.background.tag.brand` | `--af-color-background-tag-brand` | semantic |  |
| `tag.brandFg` | `color.text.tag.brand` | `--af-color-text-tag-brand` | semantic |  |
| `tag.successBg` | `color.background.tag.success` | `--af-color-background-tag-success` | semantic |  |
| `tag.successFg` | `color.text.tag.success` | `--af-color-text-tag-success` | semantic |  |
| `tag.warningBg` | `color.background.tag.warning` | `--af-color-background-tag-warning` | semantic |  |
| `tag.warningFg` | `color.text.tag.warning` | `--af-color-text-tag-warning` | semantic |  |
| `tag.dangerBg` | `color.background.tag.danger` | `--af-color-background-tag-danger` | semantic |  |
| `tag.dangerFg` | `color.text.tag.danger` | `--af-color-text-tag-danger` | semantic |  |
| `tag.infoBg` | `color.background.tag.info` | `--af-color-background-tag-info` | semantic |  |
| `tag.infoFg` | `color.text.tag.info` | `--af-color-text-tag-info` | semantic |  |

## `identity`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `identity.ink` | `color.background.identity.ink` | `--af-color-background-identity-ink` | semantic |  |
| `identity.indigo` | `color.background.identity.indigo` | `--af-color-background-identity-indigo` | semantic |  |
| `identity.green` | `color.background.identity.green` | `--af-color-background-identity-green` | semantic |  |
| `identity.ochre` | `color.background.identity.ochre` | `--af-color-background-identity-ochre` | semantic |  |
| `identity.red` | `color.background.identity.red` | `--af-color-background-identity-red` | semantic |  |
| `identity.agent` | `color.background.identity.agent` | `--af-color-background-identity-agent` | semantic |  |

## `hover`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `hover.surface` | `color.background.hover` | `--af-color-background-hover` | semantic |  |

## `fg`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `fg.strong` | `color.text.strong` | `--af-color-text-strong` | semantic |  |
| `fg.body` | `color.text.body` | `--af-color-text-body` | semantic |  |
| `fg.muted` | `color.text.muted` | `--af-color-text-muted` | semantic |  |
| `fg.subtle` | `color.text.subtle` | `--af-color-text-subtle` | semantic |  |
| `fg.faint` | `color.text.faint` | `--af-color-text-faint` | semantic |  |
| `fg.placeholder` | `color.text.placeholder` | `--af-color-text-placeholder` | semantic |  |
| `fg.onBrand` | `color.text.onBrand` | `--af-color-text-on-brand` | semantic |  |
| `fg.onInverse` | `color.text.onInverse` | `--af-color-text-on-inverse` | semantic |  |
| `fg.onBrandSoft` | `color.text.onBrandSoft` | `--af-color-text-on-brand-soft` | semantic |  |

## `link`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `link.default` | `color.text.link` | `--af-color-text-link` | semantic |  |

## `focus`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `focus.ring` | `color.border.focus` | `--af-color-border-focus` | semantic |  |

## `scrim`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `scrim.light` | `color.background.scrim.light` | `--af-color-background-scrim-light` | semantic |  |
| `scrim.default` | `color.background.scrim.default` | `--af-color-background-scrim-default` | semantic |  |
| `scrim.strong` | `color.background.scrim.strong` | `--af-color-background-scrim-strong` | semantic |  |

## `skeleton`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `skeleton.fill` | `color.background.skeleton.fill` | `--af-color-background-skeleton-fill` | semantic |  |
| `skeleton.sheen` | `color.background.skeleton.sheen` | `--af-color-background-skeleton-sheen` | semantic |  |

## `tabs`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `tabs.track` | `color.background.track` | `--af-color-background-track` | semantic | not a tabs token: the recessed track of a segmented control |

## `shadow`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `shadow.none` | `elevation.shadow.none` | `--af-elevation-shadow-none` | semantic |  |
| `shadow.hairline` | `elevation.shadow.hairline` | `--af-elevation-shadow-hairline` | semantic |  |
| `shadow.card` | `elevation.shadow.card` | `--af-elevation-shadow-card` | semantic |  |
| `shadow.raise` | `elevation.shadow.raise` | `--af-elevation-shadow-raise` | semantic |  |
| `shadow.float` | `elevation.shadow.float` | `--af-elevation-shadow-float` | semantic |  |
| `shadow.pill` | `elevation.shadow.pill` | `--af-elevation-shadow-pill` | semantic |  |
| `shadow.menu` | `elevation.shadow.menu` | `--af-elevation-shadow-menu` | semantic |  |
| `shadow.modal` | `elevation.shadow.modal` | `--af-elevation-shadow-modal` | semantic |  |
| `shadow.tooltip` | `elevation.shadow.tooltip` | `--af-elevation-shadow-tooltip` | semantic |  |
| `shadow.focus` | `elevation.shadow.focus` | `--af-elevation-shadow-focus` | semantic |  |
| `shadow.glass` | `elevation.shadow.glass` | `--af-elevation-shadow-glass` | semantic |  |
| `shadow.glassContrast` | `elevation.shadow.glassContrast` | `--af-elevation-shadow-glass-contrast` | semantic |  |

## `data`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `data.accent` | `color.background.data.accent` | `--af-color-background-data-accent` | semantic |  |
| `data.accentSoft` | `color.background.data.accentSoft` | `--af-color-background-data-accent-soft` | semantic |  |
| `data.onAccentSoft` | `color.text.data.onAccentSoft` | `--af-color-text-data-on-accent-soft` | semantic |  |
| `data.positive` | `color.background.data.positive` | `--af-color-background-data-positive` | semantic |  |
| `data.positiveSoft` | `color.background.data.positiveSoft` | `--af-color-background-data-positive-soft` | semantic |  |
| `data.onPositive` | `color.text.data.onPositive` | `--af-color-text-data-on-positive` | semantic |  |
| `data.negative` | `color.background.data.negative` | `--af-color-background-data-negative` | semantic |  |
| `data.negativeSoft` | `color.background.data.negativeSoft` | `--af-color-background-data-negative-soft` | semantic |  |
| `data.onNegative` | `color.text.data.onNegative` | `--af-color-text-data-on-negative` | semantic |  |
| `data.warning` | `color.background.data.warning` | `--af-color-background-data-warning` | semantic |  |
| `data.warningSoft` | `color.background.data.warningSoft` | `--af-color-background-data-warning-soft` | semantic |  |
| `data.onWarning` | `color.text.data.onWarning` | `--af-color-text-data-on-warning` | semantic |  |

## `control`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `control.hXxs` | `size.control.xxs` | `--af-size-control-xxs` | semantic |  |
| `control.hXs` | `size.control.xs` | `--af-size-control-xs` | semantic |  |
| `control.hMd` | `size.control.md` | `--af-size-control-md` | semantic |  |
| `control.hXl` | `size.control.xl` | `--af-size-control-xl` | semantic |  |
| `control.hInput` | `size.control.input` | `--af-size-control-input` | semantic |  |
| `control.hSm` | `size.control.sm` | `--af-size-control-sm` | semantic |  |
| `control.hLg` | `size.control.lg` | `--af-size-control-lg` | semantic |  |
| `control.hIcon` | `size.control.icon` | `--af-size-control-icon` | semantic |  |
| `control.hIconSm` | `size.control.iconSm` | `--af-size-control-icon-sm` | semantic |  |
| `control.hit` | `size.target.min` | `--af-size-target-min` | semantic |  |

## `breadcrumb`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `breadcrumb.h` | `size.layout.breadcrumbs` | `--af-size-layout-breadcrumbs` | semantic |  |

## `rail`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `rail.wNav` | `size.layout.rail` | `--af-size-layout-rail` | semantic |  |
| `rail.wSidebar` | `size.layout.sidebar` | `--af-size-layout-sidebar` | semantic |  |

## `tabbar`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `tabbar.h` | `size.layout.tabBar` | `--af-size-layout-tab-bar` | semantic |  |

## `statusbar`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `statusbar.h` | `size.layout.statusBar` | `--af-size-layout-status-bar` | semantic |  |
| `statusbar.hAndroid` | `size.layout.statusBarAndroid` | `--af-size-layout-status-bar-android` | semantic | a platform in a name: should become the Android value of size.layout.statusBar (a value change, so later) |

## `homeIndicator`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `homeIndicator.h` | `size.layout.homeIndicator` | `--af-size-layout-home-indicator` | semantic |  |

## `avatar`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `avatar.xs` | `size.avatar.xs` | `--af-size-avatar-xs` | semantic |  |
| `avatar.sm` | `size.avatar.sm` | `--af-size-avatar-sm` | semantic |  |
| `avatar.md` | `size.avatar.md` | `--af-size-avatar-md` | semantic |  |
| `avatar.lg` | `size.avatar.lg` | `--af-size-avatar-lg` | semantic |  |
| `avatar.xl` | `size.avatar.xl` | `--af-size-avatar-xl` | semantic |  |

## `text`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `text.micro` | `font.size.micro` | `--af-font-size-micro` | semantic |  |
| `text.caption` | `font.size.caption` | `--af-font-size-caption` | semantic |  |
| `text.captionLine` | `font.lineHeight.caption` | `--af-font-line-height-caption` | semantic |  |
| `text.bodySm` | `font.size.bodySm` | `--af-font-size-body-sm` | semantic |  |
| `text.bodySmLine` | `font.lineHeight.bodySm` | `--af-font-line-height-body-sm` | semantic |  |
| `text.body` | `font.size.body` | `--af-font-size-body` | semantic |  |
| `text.bodyLine` | `font.lineHeight.body` | `--af-font-line-height-body` | semantic |  |
| `text.title` | `font.size.title` | `--af-font-size-title` | semantic |  |
| `text.titleLine` | `font.lineHeight.title` | `--af-font-line-height-title` | semantic |  |
| `text.lead` | `font.size.lead` | `--af-font-size-lead` | semantic |  |
| `text.leadLine` | `font.lineHeight.lead` | `--af-font-line-height-lead` | semantic |  |
| `text.h3` | `font.size.h3` | `--af-font-size-h3` | semantic |  |
| `text.h3Line` | `font.lineHeight.h3` | `--af-font-line-height-h3` | semantic |  |
| `text.h2` | `font.size.h2` | `--af-font-size-h2` | semantic |  |
| `text.h2Line` | `font.lineHeight.h2` | `--af-font-line-height-h2` | semantic |  |
| `text.h1` | `font.size.h1` | `--af-font-size-h1` | semantic |  |
| `text.h1Line` | `font.lineHeight.h1` | `--af-font-line-height-h1` | semantic |  |
| `text.display` | `font.size.display` | `--af-font-size-display` | semantic |  |
| `text.displayLine` | `font.lineHeight.display` | `--af-font-line-height-display` | semantic |  |
| `text.largeTitle` | `font.size.largeTitle` | `--af-font-size-large-title` | semantic |  |

## `gutter`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `gutter.pane` | `space.gutter.pane` | `--af-space-gutter-pane` | semantic |  |
| `gutter.page` | `space.gutter.page` | `--af-space-gutter-page` | semantic |  |

## `checkbox`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `checkbox.size` | (same) |  | component |  |
| `checkbox.radius` | (same) |  | component |  |
| `checkbox.tickSize` | (same) |  | component |  |

## `button`

| Old | New | CSS variable | Tier | Note |
|---|---|---|---|---|
| `button.labelSm` | `button.labelFontSizeSm` | `--af-button-label-font-size-sm` | component | chosen by hand: the old name had no property word |
| `button.labelMd` | `button.labelFontSizeMd` | `--af-button-label-font-size-md` | component | chosen by hand: the old name had no property word |
| `button.labelLg` | `button.labelFontSizeLg` | `--af-button-label-font-size-lg` | component | chosen by hand: the old name had no property word |
| `button.iconSm` | `button.iconSizeSm` | `--af-button-icon-size-sm` | component | chosen by hand: the old name had no property word |
| `button.iconMd` | `button.iconSizeMd` | `--af-button-icon-size-md` | component | chosen by hand: the old name had no property word |
| `button.iconLg` | `button.iconSizeLg` | `--af-button-icon-size-lg` | component | chosen by hand: the old name had no property word |
