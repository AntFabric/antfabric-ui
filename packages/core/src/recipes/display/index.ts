// Recipes for the display components: one file per component, listed here.
import { avatar } from "./avatar";
import { avatarStack } from "./avatar-stack";
import { badge } from "./badge";
import { card } from "./card";
import { divider } from "./divider";
import { kbd } from "./kbd";
import { listItem } from "./list-item";
import { tag } from "./tag";

export const display = { avatar, "avatar-stack": avatarStack, badge, card, divider, kbd, "list-item": listItem, tag } as const;
