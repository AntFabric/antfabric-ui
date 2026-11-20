import type { Platform } from "@antfabric/ui-core";
import type { Example } from "@antfabric/ui-docs";
import { DefaultsProvider } from "../preview/kit";
import { Shot } from "../preview/ui";

export interface TileProps {
  id: string;
  example?: Example;
  /** Per platform: the documented defaults it draws with, or null where the component is not on that platform. */
  cells: { platform: Platform; label: string; defaults: Record<string, Record<string, unknown>> | null }[];
}

/** A gallery thumbnail: the component's first example on each platform, shown one platform at a time. Inert. */
export default function Tile({ id, example, cells }: TileProps) {
  return (
    <>
      {cells.map((cell) => (
        <div data-for-platform={cell.platform} key={cell.platform} inert>
          {cell.defaults ? (
            <DefaultsProvider value={cell.defaults}>
              <Shot
                id={id}
                platform={cell.platform}
                props={example?.props}
                os={example?.os}
                width={example?.width ? Math.min(example.width, 300) : undefined}
                className={`plain${example?.width ? " stretch" : ""}`}
                replay={false}
              />
            </DefaultsProvider>
          ) : (
            <div className="canvas plain" style={{ minHeight: 120 }}>
              <span className="faint" style={{ fontSize: 12, textAlign: "center", maxWidth: 220 }}>
                Not on {cell.label.toLowerCase()}
              </span>
            </div>
          )}
        </div>
      ))}
    </>
  );
}
