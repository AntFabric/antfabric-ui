// Recipes for the actions components: one file per component, listed here.
import { button } from "./button";
import { fab } from "./fab";
import { iconButton } from "./icon-button";
import { segmentedControl } from "./segmented-control";

export const actions = { button, fab, "icon-button": iconButton, "segmented-control": segmentedControl } as const;
