/**
 * `@antfabric/ui-react/shell`: one opinionated app frame, and the pictures of the native surfaces around it. Not part of the root entry,
 * which stays the generic set a product composes its own screens from. The same name, `@antfabric/ui-react-native/shell`, is the phone's.
 *
 * It holds AppMenuBar, TitleBar, WebTopBar, NavRail, SidebarItem, SidebarSection and WorkspaceSwitcher (`../components/shell`),
 * and AppBadge, OsNotification and TrayMenu (`../components/notifications/{app-badge,os-notification,tray-menu}`). Their files stay in
 * their category folders; a component moves here by its line being added below and taken out of the root's (`../index.ts`) or its
 * category's `index.ts`. `pnpm check code` holds the boundary: nothing outside this folder imports a file this entry re-exports, or
 * this entry, so the root can never reach the shell.
 */

export * from "../components/shell";
export * from "../components/notifications/app-badge";
export * from "../components/notifications/os-notification";
export * from "../components/notifications/tray-menu";
