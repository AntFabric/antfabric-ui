import { useEffect } from "react";
import { AccessibilityInfo, BackHandler, Platform, type Insets } from "react-native";

/**
 * Says `message` to VoiceOver and TalkBack. A status component (a toast, a banner, a connection change, a decided approval) calls it when
 * its message appears: iOS has no live regions, so without it nothing is read. On Android a view's `accessibilityLiveRegion` does the same
 * for text that changes in place; this is for text that arrives.
 *
 *   useEffect(() => announce(s("restored")), []);
 */
export function announce(message: string): void {
  if (!message || Platform.OS === "web") return;
  AccessibilityInfo.announceForAccessibility?.(message);
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

/** Android's back button closes this overlay while it is open (`onBack` returns nothing; the press is taken). Nothing on iOS or the web. */
export function useBackHandler(onBack: (() => void) | undefined, active = true): void {
  useEffect(() => {
    if (!active || !onBack || Platform.OS !== "android") return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onBack();
      return true;
    });
    return () => sub.remove();
  }, [active, onBack]);
}
