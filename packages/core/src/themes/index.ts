/** The presets, by name: a product passes one as it is or extends it (`defineTheme({ name, extends: themes.antfabric, … })`; with no `extends` a theme starts from `neutral`). */

import { neutralTheme } from "../theme";
import { antfabric } from "./antfabric";

/** The kit's default look. Built in `theme.ts` (`neutralTheme()`), from the input in `./neutral`. */
export const neutral = neutralTheme();

export { antfabric };

export const themes = { antfabric, neutral } as const;
