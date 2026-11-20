/**
 * `@antfabric-ui/core/chart`: what the chart libraries on both kits must agree on, with no third-party code: formatters, the value
 * scale, the sentence a screen reader hears, a chart's rows as a table, a tooltip's rows, downsampling and the series a legend has on. The kits' `data`
 * subpaths read it; it is not part of the root entry, so an app that never charts does not carry it.
 */

export * from "./format";
export * from "./grid";
export * from "./lttb";
export * from "./meter";
export * from "./panels";
export * from "./parts";
export * from "./plot";
export * from "./prepare";
export * from "./rings";
export * from "./scale";
export * from "./series";
export * from "./summarize";
export * from "./table";
export * from "./tip";
export * from "./tween";
export * from "./types";
