import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, PanResponder, Platform, Pressable, Text, View, type ViewStyle } from "react-native";
import { recipes, useControllable, usePending, useStrings, type KitStrings } from "@antfabric/ui-core";
import { createStyles, useTheme } from "../../theme";
import { announce } from "../../lib/a11y";
import { Icon, type IconName } from "../../lib/icon";
import { Enter } from "../../lib/motion";
import { usePress } from "../../lib/press";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
import { fontScale } from "../../lib/type";
import { Button } from "../actions/button";
import { Avatar, type AvatarIdentity } from "../display/avatar";
import { bezier } from "../../lib/motion";

export type NotificationItemLeading = "avatar" | "tile";
export type NotificationItemApproval = "pending" | "approving" | "approved" | "declined" | "expired";

export interface NotificationItemProps extends RootProps {
  /** "Who · #channel", or just "Who" for a DM. */
  title: string;
  /** Who did it — the face on the row. */
  sender?: string;
  /** The sender's photo. */
  avatarSrc?: string;
  /** The colour of the sender's initials when there is no `avatarSrc`. */
  identity?: AvatarIdentity;
  /** The server's bounded snippet. Two lines at most. */
  body?: string;
  /** "just now", "4m ago", "3h ago", "2d ago". */
  time?: string;
  read?: boolean;
  /** avatar: the sender's face with a small badge. tile: a 32pt glyph squircle, for an event that has no sender. */
  leading?: NotificationItemLeading;
  /** The badge on the face, or the tile's glyph. Left out, the face has no badge. */
  icon?: IconName;
  /** The sender is an agent: its face, and no badge. */
  agent?: boolean;
  /** Words before the body: "Replied in a thread". */
  lead?: string;
  /** Swiped open: Mark read and Clear show at the row's end. A swipe left opens it, a swipe right closes it. */
  revealed?: boolean;
  /** "" is not a request. pending shows Approve / Decline in the row. */
  approval?: "" | NotificationItemApproval;
  /** Set when the approval was answered on another device, e.g. "your phone". */
  decidedOn?: string;
  onOpen?: () => void;
  onMarkRead?: () => void;
  onClear?: () => void;
  /** Reports the request; Approve spins until the app answers with `approval` (or the returned promise settles). */
  onApprove?: () => void | Promise<unknown>;
  /** Reports the request; Decline spins until the app answers with `approval` (or the returned promise settles). */
  onDecline?: () => void | Promise<unknown>;
  /** This row's built-in text (its accessible name, Approve and Decline, the outcome line, the swipe actions) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["notification-item"]>;
  /** Per-part styles over the theme: `{ root: {…}, title: {…} }`. */
  styles?: PartStyles<"notification-item">;
  style?: ViewStyle;
}

/** One swipe action's width; the row slides by one or two of them. */
const ACTION = 76;
const NATIVE = Platform.OS !== "web";

/** Layout no token decides; the colours, sizes and type are the recipe's (`notificationItem`). */
const useStyles = createStyles((t) => {
  // Under the text column: past the gutter, the face and the gap.
  const indent = { paddingLeft: t.gutter.pane + t.avatar.md + t.space.md, paddingRight: t.space.lg, paddingBottom: t.space.mdLg };
  return {
    root: { overflow: "hidden" },
    hit: { flexDirection: "row", alignItems: "center", paddingVertical: t.space.md },
    face: { flexShrink: 0, alignSelf: "flex-start", marginTop: t.space["3xs"] },
    kindBadge: { position: "absolute", right: -t.space["2xs"], bottom: -t.space["2xs"], alignItems: "center", justifyContent: "center" },
    tile: { alignItems: "center", justifyContent: "center", alignSelf: "flex-start", marginTop: t.space["3xs"] },
    main: { flex: 1, minWidth: 0 },
    meta: { flexShrink: 0, alignSelf: "flex-start", alignItems: "flex-end", paddingTop: t.space["3xs"] },
    time: { fontVariant: ["tabular-nums"] },
    approval: { ...indent, flexDirection: "row", gap: t.space.xs, marginTop: -t.space.xs },
    decided: { ...indent, flexDirection: "row", alignItems: "center", marginTop: -t.space.sm },
    decidedText: { flexShrink: 1 },
    swipe: { position: "absolute", top: 0, right: 0, bottom: 0, flexDirection: "row" },
    swipeAction: { width: ACTION, alignItems: "center", justifyContent: "center", gap: t.space["2xs"] },
  };
});

export function NotificationItem({
  title,
  sender = "",
  avatarSrc = "",
  identity = "indigo",
  body = "",
  time = "",
  read = false,
  leading = "avatar",
  icon = "",
  agent = false,
  lead = "",
  revealed = false,
  approval = "",
  decidedOn = "",
  onOpen,
  onMarkRead,
  onClear,
  onApprove,
  onDecline,
  strings,
  styles,
  style,
  testID,
  ...rest
}: NotificationItemProps) {
  const { t } = useTheme();
  const s = useStyles();
  const str = useStrings("notification-item", strings);
  const press = usePress();
  // Read and revealed are the row's own look and show at once; the app's next props take over when they come.
  const [isRead, setRead] = useControllable(read);
  const [open, setOpen] = useControllable(revealed);
  // Approve and Decline report the request and spin until the app passes the answer as `approval` (or the promise settles): the row never
  // says approved before the server does.
  const decision = approval;
  const { pending, run } = usePending([approval]);
  const [asked, setAsked] = useState<"approve" | "decline">("approve");
  const waiting = decision === "approving" || pending;
  const face = leading === "avatar";
  const outcome = decision === "approved" || decision === "declined" || decision === "expired" ? decision : null;
  const where = decidedOn ? str("on", { device: decidedOn }) : "";
  const r = useRecipe(recipes["notification-item"], { variants: { read: isRead, approval: outcome }, state: { pressed: press.pressed }, styles });
  const hit = partStyle(r, "hit", { view: press.focused ? { boxShadow: `inset 0 0 0 2px ${t.focus.ring}` } : undefined });
  const decidedText = partStyle(r, "decidedText", { text: { color: r.decided.text.color } });
  // An icon's size is its width and height; what else `styles` sets on it goes on the glyph.
  const { width: tileIconSize, height: _tileIconHeight, ...tileIconRest } = r.tileIcon.view;
  const { width: decidedIconSize, height: _decidedIconHeight, ...decidedIconRest } = r.decidedIcon.view;

  // iOS has no live regions: the answer to an approval is spoken when it arrives.
  const was = useRef(outcome);
  useEffect(() => {
    if (was.current === outcome) return;
    was.current = outcome;
    if (outcome) announce(outcome === "approved" ? str("approved", { where }) : outcome === "declined" ? str("declined", { where }) : str("expired"));
  }, [outcome]); // eslint-disable-line react-hooks/exhaustive-deps

  // The row slides left by the width of the actions behind it: two while unread, one once read.
  const reach = isRead ? ACTION : ACTION * 2;
  const target = open ? -reach : 0;
  const x = useRef(new Animated.Value(target)).current;
  useEffect(() => {
    const run = Animated.timing(x, { toValue: target, duration: t.duration.slow, easing: bezier(t.ease.out), useNativeDriver: NATIVE });
    run.start();
    return () => run.stop();
  }, [target, x, t.duration, t.ease]);
  const markRead = () => {
    setRead(true);
    setOpen(false);
    onMarkRead?.();
  };
  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10 && Math.abs(g.dx) > Math.abs(g.dy),
        onPanResponderMove: (_, g) => x.setValue(Math.min(0, Math.max(-reach - 120, target + g.dx))),
        onPanResponderRelease: (_, g) => {
          const at = target + g.dx;
          // A full swipe clears it; past half the actions opens, short of that closes.
          if (at < -reach - 80) onClear?.();
          const next = at < -reach / 2 && at >= -reach - 80;
          if (next === open) Animated.timing(x, { toValue: target, duration: t.duration.slow, useNativeDriver: NATIVE }).start();
          else setOpen(next);
        },
        onPanResponderTerminate: () => x.setValue(target),
      }),
    [x, reach, target, open, setOpen, onClear, t.duration.slow],
  );

  return (
    <View {...rootProps(rest)} testID={partId(testID, "notification-item", "root")} role="listitem" style={[s.root, r.root.view, style]}>
      <Animated.View {...pan.panHandlers} style={{ transform: [{ translateX: x }] }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={[isRead ? "" : str("unread"), str("sentence", { text: title }), body ? str("sentence", { text: body }) : "", time].filter(Boolean).reduce((first, second) => str("followedBy", { first, second }))}
          // What a sighted person swipes for, in VoiceOver's rotor and TalkBack's actions menu.
          accessibilityActions={[...(isRead ? [] : [{ name: "markRead", label: str("markReadShort") }]), { name: "clear", label: str("clear") }]}
          onAccessibilityAction={(e) => (e.nativeEvent.actionName === "markRead" ? markRead() : e.nativeEvent.actionName === "clear" ? onClear?.() : undefined)}
          onPress={() => {
            setRead(true);
            onOpen?.();
          }}
          {...press.handlers}
          testID={partId(testID, "notification-item", "hit")}
          style={[s.hit, hit.view]}
        >
          {face ? (
            <View style={s.face}>
              <Avatar name={sender} src={avatarSrc} size="md" identity={agent ? "agent" : identity} agent={agent} />
              {!agent && icon ? (
                <View testID={partId(testID, "notification-item", "kindBadge")} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[s.kindBadge, r.kindBadge.view]}>
                  <Icon name={icon} size={10} strokeWidth={2.5} color={r.kindBadge.text.color} />
                </View>
              ) : null}
            </View>
          ) : (
            <View testID={partId(testID, "notification-item", "tile")} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[s.tile, r.tile.view]}>
              {icon ? <Icon testID={partId(testID, "notification-item", "tileIcon")} name={icon} size={tileIconSize as number} color={r.tile.text.color} style={Object.keys(tileIconRest).length ? tileIconRest : undefined} /> : null}
            </View>
          )}
          <View testID={partId(testID, "notification-item", "text")} style={[s.main, r.text.view]}>
            <Text testID={partId(testID, "notification-item", "title")} maxFontSizeMultiplier={fontScale.content} numberOfLines={1} style={[r.title.view, r.title.text]}>
              {title}
            </Text>
            {body ? (
              <Text testID={partId(testID, "notification-item", "body")} maxFontSizeMultiplier={fontScale.content} numberOfLines={2} style={[r.body.view, r.body.text]}>
                {lead ? (
                  <Text testID={partId(testID, "notification-item", "lead")} maxFontSizeMultiplier={fontScale.content} style={[r.lead.view, r.body.text, r.lead.text]}>{str("leadSuffix", { lead })}</Text>
                ) : null}
                {body}
              </Text>
            ) : null}
          </View>
          <View testID={partId(testID, "notification-item", "meta")} style={[s.meta, r.meta.view]}>
            <Text testID={partId(testID, "notification-item", "time")} maxFontSizeMultiplier={fontScale.content} numberOfLines={1} style={[s.time, r.time.view, r.time.text]}>
              {time}
            </Text>
            {!isRead ? <View testID={partId(testID, "notification-item", "dot")} style={r.dot.view} /> : null}
          </View>
        </Pressable>
      </Animated.View>
      {approval !== "" && !outcome ? (
        <View style={s.approval}>
          <Button
            label={str("approve")}
            variant="ink"
            size="sm"
            iconLeading="check"
            loading={decision === "approving" || (pending && asked === "approve")}
            disabled={pending && asked === "decline"}
            onPress={() => {
              setAsked("approve");
              run(onApprove);
            }}
          />
          <Button
            label={str("decline")}
            variant="secondary"
            size="sm"
            loading={pending && asked === "decline"}
            disabled={waiting && !(pending && asked === "decline")}
            onPress={() => {
              setAsked("decline");
              run(onDecline);
            }}
          />
        </View>
      ) : null}
      {approval !== "" && outcome ? (
        <Enter motion="fade" testID={partId(testID, "notification-item", "decided")} role="status" style={[s.decided, r.decided.view]}>
          <Icon
            testID={partId(testID, "notification-item", "decidedIcon")}
            name={outcome === "approved" ? "circle-check" : outcome === "declined" ? "circle-x" : "clock"}
            size={decidedIconSize as number}
            color={r.decided.text.color}
            style={Object.keys(decidedIconRest).length ? decidedIconRest : undefined}
          />
          <Text testID={partId(testID, "notification-item", "decidedText")} maxFontSizeMultiplier={fontScale.content} style={[s.decidedText, decidedText.view, decidedText.text]}>
            {outcome === "approved" ? str("approved", { where }) : outcome === "declined" ? str("declined", { where }) : str("expired")}
          </Text>
        </Enter>
      ) : null}
      {open ? (
        <Enter motion="slide-left" style={s.swipe}>
          {!isRead ? <SwipeAction testID={testID} label={str("markReadShortLabel", { title })} icon="check" text={str("markReadShort")} styles={styles} onPress={markRead} /> : null}
          <SwipeAction testID={testID} label={str("clearShortLabel", { title })} icon="trash-2" text={str("clear")} destructive styles={styles} onPress={() => onClear?.()} />
        </Enter>
      ) : null}
    </View>
  );
}

function SwipeAction({ testID, label, icon, text, destructive, styles, onPress }: { testID?: string; label: string; icon: string; text: string; destructive?: boolean; styles?: PartStyles<"notification-item">; onPress: () => void }) {
  const s = useStyles();
  const press = usePress();
  const r = useRecipe(recipes["notification-item"], { state: { pressed: press.pressed }, styles });
  const part = destructive ? "swipeDanger" : "swipeAction";
  const action = partStyle(r, part, { view: press.pressed && !destructive ? { opacity: 0.8 } : undefined });
  const swipeLabel = partStyle(r, "swipeLabel", { text: { color: r[part].text.color } });
  // An icon's size is its width and height; what else `styles` sets on it goes on the glyph.
  const { width: swipeIconSize, height: _swipeIconHeight, ...swipeIconRest } = r.swipeIcon.view;
  return (
    <Pressable testID={partId(testID, "notification-item", part)} accessibilityRole="button" accessibilityLabel={label} onPress={() => onPress()} {...press.handlers} style={[s.swipeAction, action.view]}>
      <Icon testID={partId(testID, "notification-item", "swipeIcon")} name={icon} size={swipeIconSize as number} color={r[part].text.color} style={Object.keys(swipeIconRest).length ? swipeIconRest : undefined} />
      <Text testID={partId(testID, "notification-item", "swipeLabel")} numberOfLines={1} maxFontSizeMultiplier={fontScale.chrome} style={[swipeLabel.view, swipeLabel.text]}>
        {text}
      </Text>
    </Pressable>
  );
}
