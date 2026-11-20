// Recipes for the overlays components: one file per component, listed here.
import { bottomSheet } from "./bottom-sheet";
import { commandPalette } from "./command-palette";
import { contextMenu } from "./context-menu";
import { dialog } from "./dialog";
import { hoverCard } from "./hover-card";
import { menu } from "./menu";
import { popover } from "./popover";
import { sheet } from "./sheet";
import { tooltip } from "./tooltip";

export const overlays = { "bottom-sheet": bottomSheet, "command-palette": commandPalette, "context-menu": contextMenu, dialog, "hover-card": hoverCard, menu, popover, sheet, tooltip } as const;
