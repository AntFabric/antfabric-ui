import { tokenVars } from "@antfabric/ui-core";

/**
 * Every token as a CSS variable: `t.color.background.brand.default` is `"var(--af-color-background-brand-default)"`.
 *
 * The single import every component uses for a colour, a size, a radius, a shadow or a duration.
 * Because each value is a variable rather than a literal, the theme and the platform's density come
 * from the `data-af-theme` / `data-af-platform` attributes above the component, and switch without
 * a re-render.
 */
export const t = tokenVars();
