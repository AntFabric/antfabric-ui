/**
 * The phone's reduced-motion answer, set by the run instead of by the clock. Imported first by check.tsx, before either kit.
 *
 * The React Native kit asks `AccessibilityInfo.isReduceMotionEnabled()` once, when a module loads (lib/motion.tsx's entrances, Skeleton,
 * ProgressBar, TabBar), and keeps the answer in a module variable. In Node, React Native Web has no `matchMedia` and answers `true`, but
 * through a promise: the answer only landed at the run's first `await`, the `import()` of the first screen. Every phone render before
 * it drew an entrance at its first frame (`opacity: 0`), every one after it drew it finished (`opacity: 1`). So a key's hash depended on
 * whether a screen happened to be drawn earlier in the run: `pnpm check button` drew `button/mobile#neutral` before any screen and a full
 * run after them all, and the two disagreed.
 *
 * Here the answer is a thenable that calls back at once and again whenever `setReducedMotion` changes it, so it is what the run says at
 * the moment a render is drawn, whatever the run's scope. check.tsx states it per pass.
 */
import { AccessibilityInfo } from "react-native";

let on = false;
/** The kit's module-level readers. Effects never run in a server render, so only those register. */
const readers = new Set<(on: boolean) => unknown>();
const answer = {
  then(ok?: (on: boolean) => unknown) {
    if (ok) {
      readers.add(ok);
      ok(on);
    }
    return answer;
  },
  catch() {
    return answer;
  },
};
(AccessibilityInfo as { isReduceMotionEnabled: () => Promise<boolean> }).isReduceMotionEnabled = () => answer as unknown as Promise<boolean>;

/** Whether the phone reports reduced motion from here on: entrances, skeletons and progress bars draw finished when it does. */
export function setReducedMotion(next: boolean) {
  if (next === on) return;
  on = next;
  for (const read of readers) read(on);
}
