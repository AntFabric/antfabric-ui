import { useMemo, useState } from "react";
import { useForcedState } from "@antfabric-ui/core";

export interface Press {
  pressed: boolean;
  /** Keyboard or switch-control focus (a hardware keyboard on iPad, D-pad on Android). */
  focused: boolean;
  disabled: boolean;
  /** Spread onto the Pressable. */
  handlers: {
    onPressIn: () => void;
    onPressOut: () => void;
    onFocus: () => void;
    onBlur: () => void;
  };
}

/**
 * Press and focus as state, so a style can follow them and the catalogue can force them. There is
 * no hover on a phone, so there is none here.
 */
export function usePress({ disabled = false }: { disabled?: boolean } = {}): Press {
  const forced = useForcedState();
  const [pressed, setPressed] = useState(false);
  const [focused, setFocused] = useState(false);
  const handlers = useMemo(
    () => ({
      onPressIn: () => setPressed(true),
      onPressOut: () => setPressed(false),
      onFocus: () => setFocused(true),
      onBlur: () => setFocused(false),
    }),
    [],
  );
  const off = disabled || forced === "disabled";
  return {
    pressed: !off && (forced === "pressed" || pressed),
    focused: forced === "focus" || focused,
    disabled: off,
    handlers,
  };
}
