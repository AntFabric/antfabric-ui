// Recipes for the notifications components: one file per component, listed here.
import { appBadge } from "./app-badge";
import { inAppBanner } from "./in-app-banner";
import { notificationItem } from "./notification-item";
import { notificationSchedule } from "./notification-schedule";
import { osNotification } from "./os-notification";
import { permissionPrompt } from "./permission-prompt";
import { trayMenu } from "./tray-menu";

export const notifications = { "app-badge": appBadge, "in-app-banner": inAppBanner, "notification-item": notificationItem, "notification-schedule": notificationSchedule, "os-notification": osNotification, "permission-prompt": permissionPrompt, "tray-menu": trayMenu } as const;
