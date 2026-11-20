/**
 * AntFabric's own content, kept out of the kits. A kit's English default is generic wherever the old text named AntFabric or its
 * features; the old text is AntFabric's copy, `antfabricStrings` in `@antfabric/ui-core/antfabric` (public and opt-in: an AntFabric app passes it
 * as `strings` with `theme={themes.antfabric}`). The catalogue sets it once at its root (`Stage` passes `ANTFABRIC_STRINGS`, which is that
 * same object, as `strings` to `AntFabricRoot` and `ThemeProvider`, in both theme passes), the way a real product sets its own copy.
 * Screens and `RailWindow` draw inside `Stage`, so they read it too.
 *
 * One file per category of the components, each owned by the implementer of that category: the sample data (destinations, tabs,
 * workspaces, menus) its docs' `sample`s and matrix `cases`, the screens and `RailWindow` import from `@antfabric/ui-docs`. Every name a
 * file exports is exported from here, so two files may not export the same name.
 */

import type { StringsOverrides } from "@antfabric/ui-core";
import { antfabricStrings } from "@antfabric/ui-core/antfabric";

export * from "./messaging";
export * from "./notifications";
export * from "./overlays";
export * from "./shell";

/** AntFabric's copy for every component that has some: core's `antfabricStrings`, which the catalogue sets at its root. */
export const ANTFABRIC_STRINGS: StringsOverrides = antfabricStrings;
