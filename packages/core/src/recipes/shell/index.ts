// Recipes for the shell components: one file per component, listed here.
import { appMenuBar } from "./app-menu-bar";
import { mobileHeader } from "./mobile-header";
import { navRail } from "./nav-rail";
import { sidebarItem } from "./sidebar-item";
import { sidebarSection } from "./sidebar-section";
import { tabBar } from "./tab-bar";
import { titleBar } from "./title-bar";
import { webTopBar } from "./web-top-bar";
import { workspaceSwitcher } from "./workspace-switcher";

export const shell = {
  "app-menu-bar": appMenuBar,
  "mobile-header": mobileHeader,
  "nav-rail": navRail,
  "sidebar-item": sidebarItem,
  "sidebar-section": sidebarSection,
  "tab-bar": tabBar,
  "title-bar": titleBar,
  "web-top-bar": webTopBar,
  "workspace-switcher": workspaceSwitcher,
} as const;
