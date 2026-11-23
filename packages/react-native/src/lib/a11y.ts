import { useEffect, useRef } from "react";
import { AccessibilityInfo, BackHandler, Platform, type Insets } from "react-native";

/**
 * Says `message` to VoiceOver and TalkBack. A status component (a toast, a banner, a connection change, a decided approval) calls it when
 * its message appears or changes: iOS has no live regions, so without it nothing is read, and the kit marks no view
 * `accessibilityLiveRegion` (Android only), so both phones hear the same thing once.
 *
 *   useEffect(() => announce(s("restored")), []);
 */
export function announce(message: string): void {
  if (!message || Platform.OS === "web") return;
  AccessibilityInfo.announceForAccessibility?.(message);
}

/**
 * Announces `message` each time it changes to a new text ("" or nothing says nothing): a status that changes in place (a send that failed, a
 * page count, offline), drawn as plain text beside it, with no `accessibilityLiveRegion` (Android only, and it reads text that merely ticks).
 * Not on the first render unless `initial`: what was there when the screen came is not news.
 *
 *   useAnnounce(status === "failed" ? str("failed") : "");
 */
export function useAnnounce(message: string | false | null | undefined, { initial = false }: { initial?: boolean } = {}): void {
  const said = useRef<string | false | null | undefined>(initial ? undefined : message);
  useEffect(() => {
    if (message && message !== said.current) announce(message);
    said.current = message;
    // Keyed on the text: the same words drawn again are not said again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);
}

/**
 * The `hitSlop` that grows a control drawn `width` × `height` to a `target` square (the profile's `control.hit`, 44pt), split evenly
 * between the sides: the touch area grows, the drawing does not. Nothing on a side the control already covers.
 *
 *   <Pressable hitSlop={hitSlopTo(t.control.hit, 34, 34)} …>
 */
export function hitSlopTo(target: number, height: number, width = target): Insets | undefined {
  const v = Math.max(0, Math.ceil((target - height) / 2));
  const h = Math.max(0, Math.ceil((target - width) / 2));
  return v || h ? { top: v, bottom: v, left: h, right: h } : undefined;
}

/**
 * Android's back button closes this overlay while it is open (`onBack` returns nothing; the press is taken). Nothing on iOS or the web.
 * Android calls the newest listener first, so the listener is added once each time the overlay opens, not on every render: a Select opened
 * inside a sheet stays on top and closes first. `onBack` is read when back is pressed, so a new function each render is fine.
 */
export function useBackHandler(onBack: (() => void) | undefined, active = true): void {
  const latest = useRef(onBack);
  latest.current = onBack;
  const on = active && !!onBack;
  useEffect(() => {
    if (!on || Platform.OS !== "android") return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      latest.current?.();
      return true;
    });
    return () => sub.remove();
  }, [on]);
}
