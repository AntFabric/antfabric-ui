// Recipes for the inputs components: one file per component, listed here.
import { checkbox } from "./checkbox";
import { chip } from "./chip";
import { formField } from "./form-field";
import { radioGroup } from "./radio-group";
import { searchField } from "./search-field";
import { select } from "./select";
import { switchRecipe } from "./switch";
import { textArea } from "./text-area";
import { textField } from "./text-field";

export const inputs = { checkbox, chip, "form-field": formField, "radio-group": radioGroup, "search-field": searchField, select, switch: switchRecipe, "text-area": textArea, "text-field": textField } as const;
