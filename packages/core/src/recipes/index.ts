/**
 * Every component's recipe, by docs id. A category adds its recipes in its own `index.ts`, so two
 * sessions rolling out different categories never edit the same file. Both kits import a recipe from
 * here (`recipes.button`); the docs package re-exports the lot for the catalogue.
 */
import { actions } from "./actions";
import { agent } from "./agent";
import { data } from "./data";
import { display } from "./display";
import { feedback } from "./feedback";
import { inputs } from "./inputs";
import { messaging } from "./messaging";
import { navigation } from "./navigation";
import { notifications } from "./notifications";
import { overlays } from "./overlays";
import { shell } from "./shell";
import { system } from "./system";

export const recipes = { ...actions, ...inputs, ...display, ...feedback, ...overlays, ...navigation, ...shell, ...messaging, ...notifications, ...system, ...agent, ...data } as const;
