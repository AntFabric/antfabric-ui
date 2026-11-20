import { goalLeft, meterText, OTHER, summarize } from '@antfabric/ui-core/chart';

export const left = goalLeft({ name: 'Ship', value: 3, goal: 5 });
export const text = meterText(3, 5);
export const folded = OTHER;
export const summary = summarize;
