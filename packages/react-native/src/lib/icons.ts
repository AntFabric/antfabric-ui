/**
 * The icons the kit can draw by name. It is filled only with the lucide icons the kit itself draws, imported one by one so a bundler keeps
 * those and drops the rest of lucide; an app adds the names it passes with `registerIcons`, or passes the component itself. `pnpm check code`
 * holds this list to the names the kit's source draws, and keeps every other kit file from importing lucide.
 */
import {
  Archive,
  ArrowDown,
  ArrowDownRight,
  ArrowLeft,
  ArrowUp,
  ArrowUpRight,
  AtSign,
  Battery,
  BatteryFull,
  Bell,
  BellOff,
  BellRing,
  Building2,
  ChartColumn,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleAlert,
  CircleCheck,
  CircleX,
  Clock,
  CloudDownload,
  CloudOff,
  EllipsisVertical,
  ExternalLink,
  File,
  FileArchive,
  FileAudio,
  FileCode,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Fingerprint,
  Globe,
  Inbox,
  Info,
  Keyboard,
  Lock,
  LockOpen,
  LogIn,
  Mic,
  Minus,
  Moon,
  Pause,
  Pencil,
  Pin,
  Play,
  Plus,
  Presentation,
  RefreshCw,
  RotateCcw,
  ScanFace,
  Search,
  Send,
  Signal,
  Slash,
  Smartphone,
  Smile,
  SmilePlus,
  Sparkles,
  Table2,
  Trash2,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  Type,
  User,
  UserX,
  Wifi,
  WifiOff,
  X,
} from "lucide-react-native";
import { pascal, type IconComponent } from "@antfabric/ui-core";

/** By lucide export name (`Trash2` for `"trash-2"`): the kit's own, then whatever the app registers. */
const registry = new Map<string, IconComponent>(
  Object.entries({
    Archive,
    ArrowDown,
    ArrowDownRight,
    ArrowLeft,
    ArrowUp,
    ArrowUpRight,
    AtSign,
    Battery,
    BatteryFull,
    Bell,
    BellOff,
    BellRing,
    Building2,
    ChartColumn,
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    CircleAlert,
    CircleCheck,
    CircleX,
    Clock,
    CloudDownload,
    CloudOff,
    EllipsisVertical,
    ExternalLink,
    File,
    FileArchive,
    FileAudio,
    FileCode,
    FileImage,
    FileSpreadsheet,
    FileText,
    FileVideo,
    Fingerprint,
    Globe,
    Inbox,
    Info,
    Keyboard,
    Lock,
    LockOpen,
    LogIn,
    Mic,
    Minus,
    Moon,
    Pause,
    Pencil,
    Pin,
    Play,
    Plus,
    Presentation,
    RefreshCw,
    RotateCcw,
    ScanFace,
    Search,
    Send,
    Signal,
    Slash,
    Smartphone,
    Smile,
    SmilePlus,
    Sparkles,
    Table2,
    Trash2,
    TrendingDown,
    TrendingUp,
    TriangleAlert,
    Type,
    User,
    UserX,
    Wifi,
    WifiOff,
    X,
  }),
);

/**
 * Lets `Icon` and every icon prop draw these names. Keys are lucide names in kebab case (`"git-branch"`) or export names (`GitBranch`), so
 * `registerIcons({ GitBranch, Rocket })` works as written. A name registered again replaces the earlier one, the kit's own included.
 */
export function registerIcons(icons: Record<string, IconComponent>): void {
  for (const [name, glyph] of Object.entries(icons)) registry.set(pascal(name), glyph);
}

declare const process: { env: { NODE_ENV?: string } };

const warned = new Set<string>();
/** Development builds only: a bundler replaces `process.env.NODE_ENV`, and an environment with no `process` stays quiet. */
const development = (() => {
  try {
    return process.env.NODE_ENV !== "production";
  } catch {
    return false;
  }
})();

/** The icon `name` draws, or `null` when neither the kit nor the app has registered it (said once, in development). */
export function iconFor(name: string): IconComponent | null {
  const glyph = registry.get(pascal(name));
  if (glyph) return glyph;
  if (development && !warned.has(name)) {
    warned.add(name);
    console.warn(`@antfabric/ui-react-native: no icon "${name}". Register it with registerIcons({ … }) or pass the component.`);
  }
  return null;
}
