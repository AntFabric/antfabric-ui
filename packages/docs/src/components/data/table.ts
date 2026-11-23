import type { ComponentDocs } from "../../types";

/** A calendar day as the timestamp (UTC midnight) a date cell formats: the same day wherever the page is opened. */
const utc = (y: number, m: number, d: number) => Date.UTC(y, m - 1, d);

/**
 * AntFabric's accounts, the sample every Table is drawn from unless an example brings its own. Plain data: a trend is a list of numbers (in $K, a
 * month apart), a share is 0 to 1, a date is a timestamp.
 */
const accounts = [
  ["Northwind Logistics", "Ananya Rao", "Customer", "Healthy", 186000, 0.12, [140, 148, 155, 162, 171, 186], 0.86, utc(2027, 2, 14)],
  ["Helio Labs", "Rohan Mehta", "Customer", "Watch", 92400, -0.04, [101, 99, 97, 96, 95, 92.4], 0.58, utc(2026, 12, 1)],
  ["Kestrel Health", "Priya Nair", "Renewal", "At risk", 148000, -0.11, [171, 168, 164, 159, 152, 148], 0.37, utc(2026, 11, 30)],
  ["Brightline Retail", "Karan Shah", "Customer", "Healthy", 64800, 0.07, [55, 57, 58, 60, 61, 64.8], 0.74, utc(2027, 5, 9)],
  ["Orbit Finance", "Meera Iyer", "Trial", "Watch", 18000, 0, [0, 0, 0, 12, 18, 18], 0.49, utc(2026, 11, 20)],
  ["Tidewater Foods", "Arjun Das", "Customer", "Healthy", 121500, 0.18, [88, 94, 99, 104, 110, 121.5], 0.91, utc(2027, 8, 1)],
  ["Summit Learning", "Sara Thomas", "Renewal", "Watch", 57600, 0.02, [55, 55, 56, 56, 57, 57.6], 0.63, utc(2026, 12, 15)],
  ["Lumen Energy", "Vikram Singh", "Customer", "Healthy", 233000, 0.09, [198, 204, 210, 216, 221, 233], 0.82, utc(2027, 3, 22)],
  ["Cobalt Freight", "Ananya Rao", "Customer", "At risk", 41200, -0.16, [52, 51, 49, 47, 45, 41.2], 0.31, utc(2027, 1, 10)],
  ["Juniper Studios", "Rohan Mehta", "Trial", "Healthy", 9600, 0.25, [0, 0, 4, 6, 7.7, 9.6], 0.77, utc(2026, 11, 28)],
  ["Pinecrest Bank", "Priya Nair", "Customer", "Healthy", 312000, 0.05, [284, 290, 295, 299, 305, 312], 0.88, utc(2027, 6, 30)],
  ["Atlas Mobility", "Meera Iyer", "Customer", "Watch", 76800, -0.02, [80, 79, 79, 78, 78, 76.8], 0.55, utc(2027, 4, 18)],
].map(([account, owner, stage, health, arr, change, trend, usage, renewal], i) => ({ key: `acc-${i + 1}`, account, owner, stage, health, arr, change, trend, usage, renewal }));

const day = { type: "date", timeZone: "UTC" };

/** One column of each cell type. `priority` is the phone's: the account is the card's title, health its badge, then ARR and the owner as lines. */
const columns = [
  { key: "account", label: "Account", priority: 1 },
  { key: "owner", label: "Owner", cell: "avatar", priority: 4 },
  { key: "stage", label: "Stage", cell: "tag" },
  { key: "health", label: "Health", cell: "badge", tones: { Healthy: "success", Watch: "warning", "At risk": "danger" }, rank: { "At risk": 0, Watch: 1, Healthy: 2 }, priority: 2 },
  { key: "arr", label: "ARR", cell: "currency", priority: 3 },
  { key: "change", label: "Change", cell: "delta" },
  { key: "trend", label: "6 months", cell: "sparkline" },
  { key: "usage", label: "Seats used", cell: "progress" },
  { key: "renewal", label: "Renews", cell: "date", format: day },
];

/** Five of them, for the places that show the table's behaviour more than its cells. */
const lean = [columns[0]!, columns[3]!, columns[4]!, columns[5]!, columns[8]!];

const docs: ComponentDocs = {
  id: "table",
  name: "Table",
  category: "data",
  level: "organism",
  group: "table",
  status: "draft",
  description:
    "Rows and the columns that say how to read them. Web and desktop draw a grid in a scroll region with a sticky header, right-aligned figures and a sort button on each column; the phone draws one card per row. Sorting, ticking rows and paging are the table's own, and each reports its change.",
  props: {
    columns: {
      type: "array",
      sample: columns,
      required: true,
      description:
        "One per column: { key, label, cell, align, format, priority, sortable, rank, tones, inverse, kind, width, maxWidth, wrap, emphasis }. `width` and `maxWidth` (px) and `wrap` are for web and desktop: a cell wider than `maxWidth` is cut with an ellipsis and its full text is the cell's title, or wraps with `wrap`. `emphasis` (web and desktop) draws the column that names the row stronger: `fg.strong` at medium weight, the `emphasis` part; on the phone the row's name is its card's title. `key` is the field of each row the column reads and `cell` is what it draws: text, number, currency, percent, date, delta, badge, tag, avatar, sparkline or progress. A column is plain data, so it can be written down and sent as JSON.",
    },
    rows: {
      type: "array",
      sample: accounts,
      required: true,
      description: "One object per row: [{ key: \"acc-1\", account: \"Northwind Logistics\", arr: 186000, … }, …]. The same rows can feed a chart, a stat and a table.",
    },
    rowKey: {
      type: "string",
      default: "key",
      description: "The field of each row that names it, for selection and for React's keys. The keys `selected` holds are its values as text. A row without the field is named by its index in `rows`.",
    },
    sort: {
      type: "object",
      description: "{ column, direction } with direction \"asc\" or \"desc\": the column the rows are ordered by and which way. `null` is the order the rows came in. Left out, the table keeps its own order.",
    },
    onSortChange: {
      type: "event",
      args: "sort: TableSort | null",
      changes: "sort",
      description:
        "A header was pressed (the phone: the sort Select or its direction button). The first press on a column sorts it, biggest first for a number or a date and A to Z for the rest; the second reverses it; the third gives back `null`, the order the rows came in.",
    },
    selectable: {
      type: "boolean",
      default: false,
      description: "A box before each row to tick it, and one in the header that ticks every row on the page (a dash when only some are ticked). The phone puts the same box on each card and one above the cards.",
    },
    selected: {
      type: "array",
      default: [],
      description: "The keys of the ticked rows (each row's `rowKey` field, as text). Rows on other pages stay ticked.",
    },
    onSelectedChange: {
      type: "event",
      args: "selected: string[]",
      changes: "selected",
      description: "A box was pressed. Called with every key that is ticked now, on this page and the others.",
    },
    pageSize: {
      type: "number",
      default: 0,
      description: "Rows a page. Over that many rows, a Pagination sits under the table. 0 shows every row.",
    },
    total: {
      type: "number",
      description:
        "How many rows there are in all, when `rows` holds only the page on show (a list the server pages and sorts: an ERP list of 40,000 records). The table then draws exactly the rows it is given, never sorts or slices them, and only reports `onSortChange` and `onPageChange`; the pager counts pages from `total` and `pageSize`. Left out, `rows` is every row and the table sorts and pages them itself. Past about 200 rows, set `pageSize` or page on the server: the table draws every row of a page and does not window them.",
    },
    currency: {
      type: "string",
      default: "USD",
      description: "An ISO 4217 code for the currency columns that name none in their `format`. Numbers, dates and the sort's alphabet follow the tree's locale.",
    },
    maxHeight: {
      type: "number",
      platforms: ["web", "desktop"],
      description: "The most px the table is tall: past it the rows scroll under the sticky header. Left out, the table is as tall as its rows and the header has nothing to stick to.",
    },
    renderCell: {
      type: "event",
      args: "column: TableColumn, row: Row",
      description: "Draws a cell yourself: it is called with the column and the row and RETURNS what goes in the cell (a link, a button). Returning `undefined` keeps the column's own cell. On the phone it draws that value on the card.",
    },
    renderActions: {
      type: "event",
      args: "row: Row",
      description: "Draws a row's actions (a menu, a button) and RETURNS them: in a last column with a hidden \"Actions\" header on the web, at the end of the card's head on the phone.",
    },
    onRowPress: {
      type: "event",
      args: "key: string, row: Row",
      description: "A row was pressed. On the web its first cell is a button (so the row is reachable by keyboard) and a click elsewhere on the row does the same, except on a box or a button inside it; on the phone the card's title is a button and a tap on the card does the same.",
    },
    expanded: {
      type: "array",
      default: [],
      platforms: ["mobile"],
      description: "The keys of the cards that show every column. A card with columns it does not show (a column with no `priority`, or one past the card's three lines) has a button that opens them as more label and value lines.",
    },
    onExpandedChange: {
      type: "event",
      args: "expanded: string[]",
      changes: "expanded",
      platforms: ["mobile"],
      description: "A card's details button was pressed. Called with every key that is expanded now.",
    },
    page: {
      type: "number",
      default: 1,
      description: "The page on show, counted from 1. Sorting goes back to page 1.",
    },
    onPageChange: {
      type: "event",
      args: "page: number",
      changes: "page",
      description: "A page button, previous or next was pressed, or a new sort sent the table back to page 1. Called with the page, counted from 1.",
    },
    loading: {
      type: "boolean",
      default: false,
      description: "Grey lines in place of the rows (the phone: grey cards), from the kit's Skeleton. The header stays, so the columns do not jump when the rows arrive.",
    },
    empty: {
      type: "string",
      default: "Nothing here yet.",
      description: "The title of the empty state when there are no rows. A noun phrase, not a sentence: \"No accounts match\".",
    },
    emptyLine: {
      type: "string",
      default: "",
      description: "One sentence under the title: what to do about it (\"Clear a filter to see more.\"). Empty draws only the title.",
    },
    dense: {
      type: "boolean",
      default: false,
      platforms: ["web", "desktop"],
      description: "Shorter rows (36px against 44px), for a table that is mostly data. The phone's cards have one size.",
    },
    narrow: {
      type: "enum",
      options: ["scroll", "cards"],
      default: "scroll",
      platforms: ["web", "desktop"],
      description:
        "What the table does when its own box is narrower than `table.cardsBelow` (600px), measured with a ResizeObserver on the table, not the window: `scroll` keeps the grid and scrolls it sideways; `cards` draws the phone's card per row (the `priority` columns: the title, a badge beside it and the row's actions, then a label and value line for every other column) with a sort bar above and the pager under them. Ticking, sorting, paging, `onRowPress`, `renderCell`, `renderActions`, loading and the empty state all work in both. Before it has measured (on the server) a `cards` table draws cards.",
    },
    label: {
      type: "string",
      sample: "Accounts",
      required: true,
      description: "What the table is: its caption and the scroll region's accessible name (the phone: the list's). One or two words.",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "A native <table> in a scroll region (tabindex 0), drawn from its recipe: sticky <th>, a sort <button> in each sortable header, the kit's Checkbox, Tag, Avatar, Delta, Sparkline and Meter in the cells, Skeleton rows and EmptyState; hover from useInteraction",
      import: "import { Table } from \"@antfabric/ui-react/data\"",
      notes: [
        "Shipped from the data subpath. Core's `@antfabric/ui-core/chart` holds what both kits agree on: how a column is read, how rows are ordered and paged, what the phone's card keeps.",
        "The header sticks to the top of the scroll region. A table that is as tall as its rows never scrolls the region, so it has nothing to stick to: pass `maxHeight` (or give the table a parent with a height) and the rows scroll under the header.",
        "A column is as wide as its widest cell. Wider than the region, the table scrolls sideways; the region is a keyboard stop, so the arrow keys scroll it.",
        "`narrow=\"cards\"`: below `table.cardsBelow` (600px) of its own width the table draws the phone's card per row instead of the grid, a description list of label and value lines per card, under a sort bar (the kit's Select and an IconButton). It measures its box before paint, so a page drawn in the browser never shows the other layout first; drawn on the server it starts as cards and turns into the grid once it measures a wide box. The web's card shows every column (the card's own lines, then the rest): it has no details button.",
      ],
      keyboard: [
        { keys: "Tab", action: "Moves to the scroll region, then through the sort buttons and the boxes" },
        { keys: "Enter", action: "On a sort button: sorts by that column, then reverses it, then clears it" },
        { keys: "Space", action: "On a box: ticks or unticks the row, or every row on the page" },
        { keys: "ArrowDown", action: "In the focused scroll region: scrolls the rows" },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same <table> as web, at desktop density",
      import: "import { Table } from \"@antfabric/ui-react/data\"",
      keyboard: [
        { keys: "Tab", action: "Moves to the scroll region, then through the sort buttons and the boxes" },
        { keys: "Enter", action: "On a sort button: sorts by that column, then reverses it, then clears it" },
        { keys: "Space", action: "On a box: ticks or unticks the row, or every row on the page" },
      ],
    },
    mobile: {
      status: "ready",
      base: "A View per row, as a card (decision D3): the title column beside its box and a badge, then label and value lines. A sort bar above holds the kit's Select and an IconButton; Pagination below is compact",
      import: "import { Table } from \"@antfabric/ui-react-native/data\"",
      notes: [
        "One card per row. The column with the lowest `priority` is the card's title, a `badge` column among the next three sits beside it, and the rest are label and value lines. A column with no priority is left off the card; when none has one, the columns' order is the priority.",
        "Sorting is the sort bar above the cards: the Select picks a column (the same first direction as the header's first press) and the arrow button beside it reverses the direction. \"As listed\" clears the sort. With no sortable column the bar has no Select, and with neither a sort nor `selectable` there is no bar.",
        "A card's height is its content, and `table.rowH` (52pt) is the least a one-line card is.",
        "`dense` and `maxHeight` have no meaning here and are not props on the phone.",
        "The card shows the title and three more columns, lowest `priority` first; the other columns are not dropped: the card's details button opens them in place as more label and value lines (`expanded`).",
      ],
      gestures: [
        { gesture: "Tap the box", action: "Ticks or unticks the card" },
        { gesture: "Tap the sort Select", action: "Opens the sheet of sortable columns" },
      ],
    },
  },
  a11y: {
    role: "table, in a labelled region (web, desktop); a list of cards (phone)",
    label: "The `label` prop: the table's caption and the scroll region's name",
    notes: [
      "Each sortable header carries aria-sort (ascending, descending or none) and holds a button with a visible focus ring. A press says \"Sorted by ARR, descending\" (or \"Sorting cleared\") through a polite announcement, since a reader on the button does not speak the header's aria-sort. Sorting moves no focus.",
      "Rows arriving after loading (\"12 rows loaded\") and the rows running out (\"No rows\") are announced once.",
      "A row's box is named for the row (\"Select Northwind Logistics\"), the header's \"Select all on this page\", and it reads mixed while only some rows are ticked. The ticked state is the box's: the row itself carries no aria-selected, which a plain table does not support.",
      "With `onRowPress` the first cell is a button, so the row is a keyboard stop; with `renderActions` a last, visually hidden \"Actions\" header names that column.",
      "Loading is marked aria-busy and announced once, \"Loading Accounts\"; the other grey lines are hidden from screen readers.",
      "A sparkline and a meter in a row are named for the row and the column (\"Northwind Logistics, 6 months: 140, 148, …\"), and a Delta says which way it moved and whether that is good.",
      "Phone: each label and value line of a card is one stop (\"Seats used: 86%\"), and the box and the details button stay their own. A card's title is a button when `onRowPress` is given.",
      "Colour is never the only signal: a badge is a word, a Delta has an arrow, a ticked row has a ticked box.",
    ],
  },
  examples: [
    {
      name: "Accounts",
      description: "Every cell type, sorted by ARR, five rows a page.",
      props: { columns, rows: accounts, label: "Accounts", sort: { column: "arr", direction: "desc" }, pageSize: 5 },
      width: 760,
    },
    {
      name: "Health, by rank",
      description: "A text column that sorts by a rank, not the alphabet: at risk first.",
      props: { columns: lean, rows: accounts, label: "Accounts by health", sort: { column: "health", direction: "asc" }, pageSize: 6 },
      width: 640,
    },
    {
      name: "Rows ticked",
      description: "Two accounts ticked: their rows are filled, and the header's box shows a dash.",
      props: { columns: lean, rows: accounts, label: "Accounts", selectable: true, selected: ["acc-3", "acc-9"], pageSize: 6 },
      width: 640,
    },
    {
      name: "Name emphasised",
      description: "The column that names the row has `emphasis`: its cells are drawn in the strong ink at medium weight, the rest in body text. A theme that sets `table.headRadius` also rounds the header row's ends.",
      props: { columns: lean.map((c, i) => (i === 0 ? { ...c, emphasis: true } : c)), rows: accounts.slice(0, 5), label: "Accounts" },
      width: 640,
      platforms: ["web", "desktop"],
    },
    {
      name: "Cards when narrow",
      description: "`narrow=\"cards\"` in a box narrower than `table.cardsBelow`: a card per row, the account its title and health its badge, then a line per other column, under the sort bar. Two accounts are ticked.",
      props: { columns: lean, rows: accounts, label: "Accounts", narrow: "cards", selectable: true, selected: ["acc-3", "acc-9"], sort: { column: "arr", direction: "desc" }, pageSize: 3 },
      width: 360,
      platforms: ["web", "desktop"],
    },
    {
      name: "Cards loading",
      description: "A `cards` table while its rows load: grey cards under the sort bar.",
      props: { columns: lean, rows: [], label: "Accounts", narrow: "cards", loading: true, pageSize: 3 },
      width: 360,
      platforms: ["web", "desktop"],
    },
    {
      name: "Dense",
      description: "36px rows, for a table that is mostly figures.",
      props: { columns: lean, rows: accounts.slice(0, 8), label: "Accounts", dense: true },
      width: 640,
      platforms: ["web", "desktop"],
    },
    { name: "Loading", props: { columns: lean, rows: [], label: "Accounts", loading: true, pageSize: 4 }, width: 640 },
    { name: "Empty", props: { columns: lean, rows: [], label: "Accounts", empty: "No accounts match", emptyLine: "Clear a filter to see more." }, width: 640 },
  ],
  matrix: [{ prop: "loading", width: 640 }],
  edgeCases: [
    {
      title: "No rows",
      platforms: ["web", "desktop", "mobile"],
      handling: "An empty `rows` draws the kit's EmptyState (a title and, if there is one, a line) where the rows go, under the header. Say why: nothing yet and nothing matching a filter are different sentences.",
      example: { name: "Nothing matches", props: { columns: lean, rows: [], label: "Accounts", empty: "No accounts match", emptyLine: "Clear a filter to see more." }, width: 640 },
    },
    {
      title: "A missing value",
      platforms: ["web", "desktop", "mobile"],
      handling: "A value that is not there (null, an empty string, NaN) draws an en dash in every cell type, never an empty Tag or an Avatar with no face. In a sort it goes last, whichever way the column is sorted.",
      example: {
        name: "Gaps",
        props: {
          columns: lean,
          rows: [
            { key: "acc-1", account: "Northwind Logistics", health: "Healthy", arr: 186000, change: 0.12, renewal: utc(2027, 2, 14) },
            { key: "acc-5", account: "Orbit Finance", health: null, arr: null, change: null, renewal: null },
            { key: "acc-9", account: "Cobalt Freight", health: "At risk", arr: 41200, change: -0.16, renewal: utc(2027, 1, 10) },
          ],
          label: "Accounts",
          sort: { column: "arr", direction: "desc" },
        },
        width: 640,
      },
    },
    {
      title: "More rows than a page",
      platforms: ["web", "desktop", "mobile"],
      handling: "Past `pageSize` rows the table pages, and ticked rows stay ticked on the pages you leave: the header's box ticks the rows on the page you are looking at. Sorting orders every row, then goes back to page 1.",
      example: { name: "Three pages", props: { columns: lean, rows: accounts, label: "Accounts", pageSize: 5, selectable: true, selected: ["acc-1", "acc-2", "acc-8"], page: 2 }, width: 640 },
    },
    {
      title: "A long name",
      platforms: ["web", "desktop", "mobile"],
      handling: "A cell keeps one line. On the web a column grows with its widest cell and the table scrolls sideways when it must; on the phone the card's title and values are cut with an ellipsis.",
      example: {
        name: "Long",
        props: {
          columns: lean,
          rows: [
            { key: "acc-1", account: "Northwind Logistics and Cold Chain Partners, Southeast Asia", health: "Healthy", arr: 186000, change: 0.12, renewal: utc(2027, 2, 14) },
            { key: "acc-2", account: "Helio Labs", health: "Watch", arr: 92400, change: -0.04, renewal: utc(2026, 12, 1) },
          ],
          label: "Accounts",
        },
        width: 520,
      },
    },
    {
      title: "A narrow box with nothing to show",
      platforms: ["web", "desktop"],
      handling: "A `cards` table with no rows draws the same EmptyState as the grid, under the sort bar, and says why. With no sortable column and no `selectable`, there is no sort bar at all.",
      example: { name: "Narrow, empty", props: { columns: lean, rows: [], label: "Accounts", narrow: "cards", empty: "No accounts match", emptyLine: "Clear a filter to see more." }, width: 360 },
    },
    {
      title: "Columns with no priority",
      platforms: ["mobile"],
      handling: "The phone's card keeps the columns that have a `priority`, lowest first; the rest stay in the grid on web and desktop (and, with `narrow=\"cards\"`, as lines after the card's own). A table whose columns have no priority at all shows the first four, in order.",
      example: { name: "No priorities", props: { columns: lean.map(({ priority: _p, ...c }) => c), rows: accounts.slice(0, 3), label: "Accounts" } },
    },
  ],
  related: ["pagination", "checkbox", "tag", "avatar", "delta", "sparkline", "meter", "select", "empty-state", "skeleton"],
  flows: [
    {
      id: "sort-by-arr",
      title: "Sort accounts by ARR",
      description: "Pressing a header sorts the table, and pressing it again reverses it. The first press on a number goes biggest first.",
      platforms: ["web", "desktop", "mobile"],
      width: 640,
      steps: [
        {
          kind: "data",
          title: "The app holds the rows and the order",
          detail: "The rows come from a query and the order is the app's own state, so it can live in the URL or be saved with a view. Left out, the table keeps its own order and still reports each change.",
          code: "const [sort, setSort] = useState<TableSort | null>(null)",
          platforms: ["web", "desktop"],
        },
        {
          kind: "data",
          title: "The app holds the rows and the order",
          detail: "The same state as on the web. The sort bar above the cards shows it: its Select names the column and the arrow beside it the direction.",
          code: "const [sort, setSort] = useState<TableSort | null>(null)",
          platforms: ["mobile"],
        },
        {
          kind: "trigger",
          title: "The ARR header is pressed",
          detail: "The header is a button, so it takes a click, Enter or Space. A column that has not been sorted yet sorts the way you read it: a number or a date biggest first, a name A to Z.",
          platforms: ["web", "desktop"],
        },
        {
          kind: "trigger",
          title: "ARR is picked in the sort Select",
          detail: "The Select opens a sheet of the sortable columns, and \"As listed\" clears the sort. A pick starts at the column's first direction, as a header's first press does.",
          platforms: ["mobile"],
        },
        {
          kind: "event",
          title: "onSortChange fires with the new order",
          detail: "The payload is the whole sort, never the DOM event: a column and a direction. A third press on the same column sends null.",
          code: "onSortChange?.({ column: \"arr\", direction: \"desc\" })",
        },
        {
          kind: "state",
          title: "The order is set, and the page goes back to 1",
          detail: "A new order makes page 3 a different set of rows, so a paged table reports onPageChange(1) with it. Ticked rows stay ticked.",
          code: "setSort(next)  // onPageChange?.(1) when the table was past page 1",
          platforms: ["web", "desktop"],
        },
        {
          kind: "state",
          title: "The order is set, and the page goes back to 1",
          detail: "A new order makes page 3 a different set of rows, so a paged table reports onPageChange(1) with it. Ticked cards stay ticked.",
          code: "setSort(next)  // onPageChange?.(1) when the table was past page 1",
          platforms: ["mobile"],
        },
        {
          kind: "result",
          title: "The rows are reordered",
          detail: "Pinecrest Bank, $312,000, comes first. The ARR header reads sorted descending (aria-sort) and its arrow points down; a row with no ARR goes last, whichever way it is sorted.",
          platforms: ["web", "desktop"],
        },
        {
          kind: "result",
          title: "The cards are reordered",
          detail: "Pinecrest Bank, $312,000, is the first card, and the Select reads ARR beside a down arrow. Pressing the arrow reverses the order.",
          platforms: ["mobile"],
        },
      ],
      replay: [
        { step: 0, hold: 1500, platforms: ["web", "desktop"], props: { columns: lean, rows: accounts, label: "Accounts", pageSize: 5 } },
        { step: 1, hold: 1500, platforms: ["mobile"], props: { columns: lean, rows: accounts, label: "Accounts", pageSize: 3 } },
        { step: 2, press: "ARR", hold: 1100, platforms: ["web", "desktop"], props: { columns: lean, rows: accounts, label: "Accounts", pageSize: 5 } },
        { step: 7, hold: 2200, platforms: ["web", "desktop"], props: { columns: lean, rows: accounts, label: "Accounts", pageSize: 5, sort: { column: "arr", direction: "desc" } } },
        { step: 8, hold: 2200, platforms: ["mobile"], props: { columns: lean, rows: accounts, label: "Accounts", pageSize: 3, sort: { column: "arr", direction: "desc" } } },
      ],
    },
    {
      id: "tick-two-accounts",
      title: "Tick an account that is at risk",
      description: "Each row has its own box and the header has one for the page. The app gets every key that is ticked, so it can act on them in one go.",
      platforms: ["web", "desktop", "mobile"],
      width: 640,
      steps: [
        {
          kind: "data",
          title: "The app holds the ticked keys",
          detail: "The keys are each row's `rowKey` field, as text. They are the app's state because what they are for (assign an owner, export) is the app's too, and it decides when to clear them.",
          code: "const [picked, setPicked] = useState<string[]>([])",
          platforms: ["web", "desktop"],
        },
        {
          kind: "data",
          title: "The app holds the ticked keys",
          detail: "The same state as on the web: the keys of the ticked cards, each row's `rowKey` field as text.",
          code: "const [picked, setPicked] = useState<string[]>([])",
          platforms: ["mobile"],
        },
        {
          kind: "trigger",
          title: "The box on Kestrel Health is pressed",
          detail: "The box is the target, not the row: pressing the row elsewhere does nothing, so a row can later carry its own press. The box is named for the row, \"Select Kestrel Health\".",
          platforms: ["web", "desktop"],
        },
        {
          kind: "trigger",
          title: "The box on Kestrel Health's card is tapped",
          detail: "The box sits at the start of the card, beside its title.",
          platforms: ["mobile"],
        },
        {
          kind: "event",
          title: "onSelectedChange fires with every key that is ticked",
          detail: "Not the one that moved: the whole selection, on this page and the others, so the app never has to merge.",
          code: "onSelectedChange?.([\"acc-3\"])",
          platforms: ["web", "desktop"],
        },
        {
          kind: "event",
          title: "onSelectedChange fires with every key that is ticked",
          detail: "Not the one that moved: the whole selection, on this page and the others, so the app never has to merge.",
          code: "onSelectedChange?.([\"acc-3\"])",
          platforms: ["mobile"],
        },
        {
          kind: "state",
          title: "The app sets the keys",
          code: "setPicked(keys)",
        },
        {
          kind: "result",
          title: "The row is filled and the header's box shows a dash",
          detail: "A ticked row takes the selected fill and is aria-selected. With some rows on the page ticked and some not, the header's box is a dash (mixed); ticking it ticks the rest, and ticking it again clears the page.",
          platforms: ["web", "desktop"],
        },
        {
          kind: "result",
          title: "The card is filled and its edge turns to the accent",
          detail: "A ticked card takes the selected fill and an accent edge, so what is ticked reads from the whole card and not only from its small box. The box above the cards shows a dash.",
          platforms: ["mobile"],
        },
      ],
      replay: [
        { step: 0, hold: 1500, platforms: ["web", "desktop"], props: { columns: lean, rows: accounts, label: "Accounts", selectable: true, selected: [], pageSize: 5, sort: { column: "health", direction: "asc" } } },
        { step: 1, hold: 1500, platforms: ["mobile"], props: { columns: lean, rows: accounts, label: "Accounts", selectable: true, selected: [], pageSize: 3, sort: { column: "health", direction: "asc" } } },
        { step: 2, press: "Select Kestrel Health", hold: 1100, platforms: ["web", "desktop"], props: { columns: lean, rows: accounts, label: "Accounts", selectable: true, selected: [], pageSize: 5, sort: { column: "health", direction: "asc" } } },
        { step: 7, hold: 2200, platforms: ["web", "desktop"], props: { columns: lean, rows: accounts, label: "Accounts", selectable: true, selected: ["acc-3"], pageSize: 5, sort: { column: "health", direction: "asc" } } },
        { step: 8, hold: 2200, platforms: ["mobile"], props: { columns: lean, rows: accounts, label: "Accounts", selectable: true, selected: ["acc-3"], pageSize: 3, sort: { column: "health", direction: "asc" } } },
      ],
    },
  ],
};

export default docs;
