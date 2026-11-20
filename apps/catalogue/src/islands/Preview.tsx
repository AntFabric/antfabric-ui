import { DefaultsProvider } from "../preview/kit";
import { Shot, type ShotProps } from "../preview/ui";

/** A single live preview, for pages that show one here and there (the gallery, the overview). */
export default function Preview({ defaults, ...shot }: ShotProps & { defaults: Record<string, Record<string, unknown>> }) {
  return (
    <DefaultsProvider value={defaults}>
      <Shot {...shot} />
    </DefaultsProvider>
  );
}
