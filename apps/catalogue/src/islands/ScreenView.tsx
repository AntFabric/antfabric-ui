import type { ComponentType } from "react";
import type { Platform } from "@antfabric-ui/core";
import { osOf, usePrefs } from "../lib/prefs";
import { Stage } from "../preview/kit";

/** Every screen's drawing: `src/screens/<id>.tsx`, composed from the kit of its platform. */
const screens = import.meta.glob<{ default: ComponentType }>("../screens/*.tsx", { eager: true });

/** A whole screen, inside its device frame, drawn with the visitor's OS and theme. */
export default function ScreenView({ id, platform }: { id: string; platform: Platform }) {
  const prefs = usePrefs();
  const { os, osVersion } = osOf(prefs, platform);
  const Screen = screens[`../screens/${id}.tsx`]?.default;
  return (
    <div className="canvas plain" data-af-platform={platform} data-af-theme={prefs.scheme}>
      <div data-preview-root>
        <div className="w">
          <Stage autoFocus={false} platform={platform} os={os} osVersion={osVersion} scheme={prefs.scheme}>
            {Screen ? <Screen /> : <div className="af-missing">The {id} screen is not drawn yet.</div>}
          </Stage>
        </div>
      </div>
    </div>
  );
}
