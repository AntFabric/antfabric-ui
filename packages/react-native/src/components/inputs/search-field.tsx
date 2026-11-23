import { useRef, useState } from "react";
import { TextInput, View, type ViewStyle } from "react-native";
import { recipes, useControllable, useStrings, type KitStrings } from "@antfabric/ui-core";
import { createStyles } from "../../theme";
import { Icon, Spinner } from "../../lib/icon";
import { useRecipe, type PartStyles } from "../../lib/recipe";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
import { fontScale } from "../../lib/type";
import { useFormField } from "./form-field";
import { IconButton } from "../actions/icon-button";

export interface SearchFieldProps extends RootProps {
  /** What is in the box. The field reports every change, and the ✕ through onClear. */
  value?: string;
  /** Say what is searched, not "Search" — the field is the only hint of what a screen holds. */
  placeholder?: string;
  /** Accessibility label when it should differ from the placeholder. Falls back to the placeholder. */
  label?: string;
  /** A search is in flight: the glass becomes a spinner. Off for instant filtering. */
  busy?: boolean;
  /** Mark the edge while the field holds text — for a box narrowing a list you can see. */
  accent?: boolean;
  /** Draws the focused look without real focus. */
  focused?: boolean;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
  onClear?: () => void;
  /** The keyboard's Search key. */
  onSubmit?: () => void;
  /** This field's built-in text (the clear button's label) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["search-field"]>;
  /** Per-part styles over the theme: `{ root: {…}, input: {…}, clear: {…} }`. */
  styles?: PartStyles<"search-field">;
  style?: ViewStyle;
}

/** Layout no token decides; V2's search box (44pt, 12pt corners, a hairline edge and no shadow) is the recipe's. */
const useStyles = createStyles(() => ({
  root: { flexDirection: "row", alignItems: "center", width: "100%" },
  input: { flexGrow: 1, flexShrink: 1, alignSelf: "stretch", padding: 0 },
}));

export function SearchField({
  value,
  placeholder = "",
  label = "",
  busy = false,
  accent = false,
  focused = false,
  disabled = false,
  onValueChange,
  onClear,
  onSubmit,
  strings,
  styles,
  style,
  testID,
  ...rest
}: SearchFieldProps) {
  const s = useStyles();
  const form = useFormField();
  const inputRef = useRef<TextInput>(null);
  const str = useStrings("search-field", strings);
  const [query = "", setQuery] = useControllable(value, onValueChange);
  const [hasFocus, setFocus] = useState(false);
  const isFocused = focused || hasFocus;
  const r = useRecipe(recipes["search-field"], { state: { on: accent && !!query, focus: isFocused, disabled }, styles });
  const { placeholderTextColor, ...inputText } = r.input.text;
  // An icon's size is its width and height (`size`); what else `styles` sets on it goes on the glyph.
  const { width: iconSize, height: _ih, ...iconRest } = r.icon.view;
  const { width: spinSize, height: _sh, ...spinRest } = r.spinner.view;
  return (
    <View testID={partId(testID, "search-field", "root")} {...rootProps(rest)} style={[s.root, r.root.view, style]}>
      {busy ? (
        <Spinner testID={partId(testID, "search-field", "spinner")} label={str("loading")} size={spinSize as number} color={r.spinner.text.color} style={Object.keys(spinRest).length ? spinRest : undefined} />
      ) : (
        <Icon testID={partId(testID, "search-field", "icon")} name="search" size={iconSize as number} color={r.icon.text.color} style={Object.keys(iconRest).length ? iconRest : undefined} />
      )}
      <TextInput
        ref={inputRef}
        testID={partId(testID, "search-field", "input")}
        accessibilityRole="search"
        accessibilityLabel={label || placeholder || form?.label}
        accessibilityHint={form?.hint}
        maxFontSizeMultiplier={fontScale.content}
        accessibilityState={{ disabled, busy }}
        value={query}
        onChangeText={(next) => setQuery(next)}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        editable={!disabled}
        returnKeyType="search"
        onSubmitEditing={() => onSubmit?.()}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={[s.input, r.input.view, inputText]}
      />
      {query ? (
        <IconButton
          testID={partId(testID, "search-field", "clear")}
          icon="x"
          label={str("clearSearch")}
          size="sm"
          disabled={disabled}
          style={r.clear.view}
          onPress={() => {
            setQuery("");
            onClear?.();
            // The clear button goes away with the text: focus stays in the field.
            inputRef.current?.focus();
          }}
        />
      ) : null}
    </View>
  );
}
