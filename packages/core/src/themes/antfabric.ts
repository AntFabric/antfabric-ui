/**
 * AntFabric's own look: `tokens.ts` as it stands, so no overrides and no recipes. It starts from the schema (`extends: null`), since a theme
 * with no `extends` starts from `neutral`. Its id is `""`, its sheet is empty, and resolving with it is resolving with no theme at all
 * (the same object).
 */

import { defineTheme } from "../theme";

export const antfabric = defineTheme({ name: "antfabric", extends: null });
