import { useMemo, type ReactNode } from "react";
import { View } from "react-native";
import { defineTheme, themes, type BrandTokens, type Platform, type Theme } from "@antfabric-ui/core";
import { osOf, usePrefs } from "../lib/prefs";
import { BRAND_SAMPLE } from "../lib/brand";
import { DefaultsProvider, Stage, Thing } from "../preview/kit";
import { Canvas } from "../preview/ui";

export interface BrandPreviewProps {
  platform: Platform;
  /** The tenant's brand, drawn beside the default. */
  brand: Partial<BrandTokens>;
  tenant: string;
  defaults: Record<string, Record<string, unknown>>;
}

/** The same few components twice on one kit: under the `neutral` theme, and under a theme the tenant's `brand` makes (`defineTheme({ name, extends: neutral, brand })`). */
export default function BrandPreview({ platform, brand, tenant, defaults }: BrandPreviewProps) {
  const prefs = usePrefs();
  const where = osOf(prefs, platform);
  const branded = useMemo(() => defineTheme({ name: tenant, extends: themes.neutral, brand }), [tenant, brand]);
  const column = (label: string, theme: Theme): ReactNode => {
    const items = BRAND_SAMPLE.map((s) => <Thing key={s.id} id={s.id} platform={platform} props={s.props} />);
    return (
      <div>
        <Canvas platform={platform} className="plain stretch" label={`${label}, ${platform}`} replay={false}>
          {() => (
            <Stage autoFocus={false} platform={platform} os={where.os} osVersion={where.osVersion} scheme={prefs.scheme} theme={theme}>
              {platform === "mobile" ? (
                <View style={{ gap: 16, alignItems: "flex-start" }}>{items}</View>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>{items}</div>
              )}
            </Stage>
          )}
        </Canvas>
        <div className="cap">
          <b>{label}</b>
          <span className="faint">{theme === branded ? (platform === "mobile" ? "ThemeProvider theme, brand in the theme" : "AntFabricRoot theme, brand in the theme") : "neutral, no brand"}</span>
        </div>
      </div>
    );
  };
  return (
    <DefaultsProvider value={defaults}>
      <div className="grid c2">
        {column("Neutral", themes.neutral)}
        {column(tenant, branded)}
      </div>
    </DefaultsProvider>
  );
}
