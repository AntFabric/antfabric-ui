import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "pagination",
  name: "Pagination",
  category: "data",
  level: "molecule",
  group: "table",
  status: "draft",
  description:
    "Where you are in a long list and the way to move: a summary of the rows on show, previous and next, and the page numbers, with the page you are on filled. A Table draws one under itself when it has more rows than a page; a list or a feed can use it alone.",
  props: {
    page: {
      type: "number",
      default: 1,
      description: "The page on show, counted from 1. A value outside the pages is brought back inside them.",
    },
    total: {
      type: "number",
      sample: 48,
      description: "How many rows there are in all. Gives the summary (\"Showing 6–10 of 48\") and, with `pageSize`, the page count.",
    },
    pageCount: {
      type: "number",
      description: "How many pages there are, for a list whose total is not known: the summary then reads \"Page 3 of 7\". Left out, it is worked out from `total` and `pageSize`.",
    },
    pageSize: { type: "number", default: 10, sample: 5, description: "Rows a page. Changeable when `pageSizes` is given." },
    pageSizes: {
      type: "array",
      description: "The choices of rows a page ([10, 25, 100]): a labelled \"Rows per page\" Select beside the summary. Left out, the page size is not the reader's to change.",
    },
    jump: {
      type: "boolean",
      default: false,
      description: "A labelled \"Go to page\" Select of every page, to go straight to one. Meant for up to a few hundred pages; past twelve it is searchable.",
    },
    onPageSizeChange: {
      type: "event",
      args: "pageSize: number",
      changes: "pageSize",
      description: "A choice was made in the page-size Select. Called with the rows a page; the pager goes back to page 1 with it.",
    },
    compact: {
      type: "boolean",
      default: false,
      description: "The summary, previous and next, with no page buttons and a shorter summary (\"6–10 of 48\"). For a narrow place; the phone's Table uses it.",
    },
    onPageChange: {
      type: "event",
      args: "page: number",
      changes: "page",
      description: "A page button, previous or next was pressed. Called with the page it goes to, counted from 1. It is never called for the page already on show.",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "A <nav> labelled \"Pages\" holding the summary and a list: the kit's IconButton for previous and next, its Button for each page (the current one soft)",
      import: "import { Pagination } from \"@antfabric-ui/react/data\"",
      notes: [
        "Seven page slots at most: past seven pages the first, the last and the neighbours of the current one are drawn with a gap between, so the pager is always the same width.",
        "The current page is marked on its button (aria-current), and each page button is named \"Page 3\"; this relies on the kit's Button passing `aria-label` and `aria-current` to its element.",
      ],
      keyboard: [
        { keys: "Tab", action: "Moves through previous, the pages and next" },
        { keys: "Enter", action: "Goes to the page" },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same <nav> as web, at desktop density",
      import: "import { Pagination } from \"@antfabric-ui/react/data\"",
      keyboard: [
        { keys: "Tab", action: "Moves through previous, the pages and next" },
        { keys: "Enter", action: "Goes to the page" },
      ],
    },
    mobile: {
      status: "ready",
      base: "A View holding the summary and the kit's IconButton and Button, at the phone's sizes",
      import: "import { Pagination } from \"@antfabric-ui/react-native/data\"",
      notes: ["A phone has room for the summary and the two arrows: pass `compact`, as the phone's Table does. Page buttons are there for a tablet."],
    },
  },
  a11y: {
    role: "navigation (web, desktop)",
    label: "\"Pages\"; previous and next are \"Previous page\" and \"Next page\", the pages are \"Page 3\" with the current one marked aria-current (web) or selected (phone)",
    notes: [
      "The summary is a polite live region, so paging announces \"Showing 6–10 of 48\" without moving focus.",
      "On the first page previous is disabled, on the last next is. When the button a keyboard user pressed becomes disabled, focus moves to the current page button (or, in a compact pager, to the other arrow) so they keep their place.",
      "`pageSizes` and `jump` are labelled Selects (\"Rows per page\", \"Go to page\").",
      "The gap between page numbers is hidden from screen readers.",
    ],
  },
  examples: [
    { name: "First page", props: { page: 1, total: 48, pageSize: 5 }, width: 560 },
    { name: "A page in the middle", description: "Page 6 of 10: the first, the last and the neighbours, with gaps between.", props: { page: 6, total: 48, pageSize: 5 }, width: 560 },
    { name: "Compact", props: { page: 2, total: 48, pageSize: 5, compact: true }, width: 360 },
    { name: "Total not known", description: "A feed that only says how many pages there are.", props: { page: 3, pageCount: 7, total: undefined }, width: 560 },
    { name: "The last page", props: { page: 10, total: 48, pageSize: 5 }, width: 560 },
    { name: "Page size and jump", description: "Rows per page and a Select to go straight to a page.", props: { page: 2, total: 240, pageSize: 25, pageSizes: [10, 25, 100], jump: true }, width: 760 },
  ],
  matrix: [{ prop: "compact", width: 560 }],
  edgeCases: [
    {
      title: "One page",
      platforms: ["web", "desktop", "mobile"],
      handling: "Previous and next are both disabled and one page is drawn, filled. A Table draws no Pagination at all while its rows fit one page; a list that always shows one should do the same.",
      example: { name: "One page", props: { page: 1, total: 4, pageSize: 5 }, width: 560 },
    },
    {
      title: "A page that is not there",
      platforms: ["web", "desktop", "mobile"],
      handling: "A `page` below 1 or past the last is brought back inside the pages, so a list that shrank under the person (a filter that left 2 pages) still shows a real page. The summary follows it.",
      example: { name: "Past the end", props: { page: 9, total: 12, pageSize: 5 }, width: 560 },
    },
    {
      title: "Hundreds of pages",
      platforms: ["web", "desktop", "mobile"],
      handling: "The slots stay seven: the first, the last, the current page and one either side. Press the last to jump to it.",
      example: { name: "A long list", props: { page: 120, total: 2400, pageSize: 10 }, width: 560 },
    },
  ],
  related: ["table", "button", "icon-button"],
  flows: [
    {
      id: "next-page",
      title: "Go to the next page of accounts",
      description: "Pressing a page button, or next, asks the app for that page. The summary and the filled page follow.",
      platforms: ["web", "desktop", "mobile"],
      width: 560,
      steps: [
        {
          kind: "data",
          title: "The app holds the page",
          detail: "The page is the app's state, so it can live in the URL (?page=2) and survive a reload. Left out, the pager keeps its own.",
          code: "const [page, setPage] = useState(1)",
        },
        {
          kind: "trigger",
          title: "Next page is pressed",
          detail: "An IconButton labelled \"Next page\", disabled on the last page.",
        },
        {
          kind: "event",
          title: "onPageChange fires with the page",
          detail: "The number of the page it goes to, counted from 1: never a DOM event, and never the page already on show.",
          code: "onPageChange?.(2)",
        },
        {
          kind: "state",
          title: "The app sets the page",
          code: "setPage(2)",
        },
        {
          kind: "result",
          title: "The summary and the filled page follow",
          detail: "\"Showing 6–10 of 48\" is announced politely, and previous comes on. Focus stays on the button that was pressed.",
        },
      ],
      replay: [
        { step: 0, hold: 1400, props: { page: 1, total: 48, pageSize: 5 } },
        { step: 1, press: "Next page", hold: 1000, props: { page: 1, total: 48, pageSize: 5 } },
        { step: 4, hold: 2000, props: { page: 2, total: 48, pageSize: 5 } },
      ],
    },
  ],
};

export default docs;
