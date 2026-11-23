/**
 * Every lucide icon, registered with both kits. A kit ships only the icons it draws itself; the catalogue draws AntFabric's samples, which
 * name icons the kits do not (a channel's, an agent's, a file's), so it registers all of them the way an app registers the ones it uses.
 * `kit.tsx` imports this first, so every island and every script that draws through `Stage` has them. The phone kit's are lucide-react's
 * here too: the catalogue resolves `lucide-react-native` to it.
 */
import * as lucide from "lucide-react";
import { registerIcons as registerWeb, type IconComponent } from "@antfabric/ui-react";
import { registerIcons as registerPhone } from "@antfabric/ui-react-native";

const all = Object.fromEntries(Object.entries(lucide).filter(([, g]) => g !== null && typeof g === "object" && "$$typeof" in g)) as Record<string, IconComponent>;

registerWeb(all);
registerPhone(all);
