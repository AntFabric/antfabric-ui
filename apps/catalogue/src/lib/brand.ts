/**
 * The sample tenant the catalogue and `pnpm check brand` draw: a made-up freight company, so the retint
 * is seen on something that is not AntFabric's coral. Nothing here is a real customer.
 */

import type { BrandTokens } from "@antfabric-ui/core";

export const SAMPLE_TENANT: { name: string; brand: Partial<BrandTokens> } = {
  name: "Antagents",
  brand: { primary: "#0f766e", accent: "#f59e0b" },
};

/** What the preview draws, in order: the components that read the brand family. Their docs' defaults draw the rest. */
export const BRAND_SAMPLE: { id: string; props?: Record<string, unknown> }[] = [
  { id: "button", props: { label: "Book a pickup", iconLeading: "truck" } },
  { id: "switch" },
  { id: "tabs" },
  { id: "chip" },
  { id: "badge", props: { count: 3 } },
  { id: "progress-bar", props: { value: 64 } },
];
