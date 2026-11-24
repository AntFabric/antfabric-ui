"""Proposes the category-first name of every token, for review. Reads packages/core/tokens.json; writes reports/migration/tokens-2.{md,json}."""
import json, re, collections, sys
ROOT = '/Users/bittasingha/antfabric-ui-public/'
d = json.load(open(ROOT + 'packages/core/tokens.json'))
EXT = 'com.antfabric'

def leafs(n, p=(), t=None):
    if '$value' in n:
        yield p, n, n.get('$type', t)
    else:
        t = n.get('$type', t)
        for k, v in n.items():
            if not k.startswith('$'):
                yield from leafs(v, p + (k,), t)

TOK = [(p, n, t) for p, n, t in leafs(d) if p[0] != 'primitives']
lower = lambda s: s[:1].lower() + s[1:]
words = lambda k: re.findall(r'[A-Z]?[a-z0-9]+|[A-Z]+(?![a-z])', k)

# ---------- semantic groups: explicit rules ----------
def strip(prefix, key):
    assert key.startswith(prefix) and len(key) > len(prefix), (prefix, key)
    return lower(key[len(prefix):])

SIZE_WORD = {'xxs': 'xxs', 'xs': 'xs', 'sm': 'sm', 'md': 'md', 'lg': 'lg', 'xl': 'xl'}

def semantic(group, key, typ):
    """returns (new path, note) or None when the group is not semantic"""
    g, k = group, key
    if g == 'fg': return f'color.text.{k}', ''
    if g == 'surface': return f'color.background.{k}', ''
    if g == 'border':
        if typ == 'dimension': return f'border.width.{strip("w", k)}', ''
        return f'color.border.{"selected" if k == "active" else k}', ('"active" is the focused, selected or filtered edge: the standard word is selected' if k == 'active' else '')
    if g == 'brand':
        m = {'default': 'default', 'hover': 'hover', 'active': 'pressed', 'soft': 'soft', 'softHover': 'softHover', 'tint': 'tint'}
        return f'color.background.brand.{m[k]}', ('"active" is the pressed fill' if k == 'active' else '')
    if g == 'accent': return f'color.background.accent.{k}', ''
    if g in ('success', 'warning', 'info'):
        return (f'color.text.{g}', 'the role is text, icons and progress') if k == 'default' else (f'color.background.{g}.{k}', '')
    if g == 'danger':
        m = {'default': 'color.text.danger', 'hover': 'color.text.dangerHover', 'soft': 'color.background.danger.soft', 'solid': 'color.background.danger.default',
             'solidHover': 'color.background.danger.hover', 'fg': 'color.text.onDanger'}
        return m[k], ''
    if g == 'tag':
        m = re.fullmatch(r'(\w+?)(Bg|Fg)', k)
        return f'color.{"background" if m.group(2) == "Bg" else "text"}.tag.{m.group(1)}', ''
    if g in ('identity', 'presence', 'scrim', 'skeleton'): return f'color.background.{g}.{k}', ''
    if g == 'hover': return 'color.background.hover', ''
    if g == 'focus': return 'color.border.focus', ''
    if g == 'link': return 'color.text.link', ''
    if g == 'tabs': return 'color.background.track', 'not a tabs token: the recessed track of a segmented control'
    if g == 'banner': return 'color.border.warning', ''
    if g == 'data':
        if k.startswith('on'): return f'color.text.data.{k}', ''
        return f'color.background.data.{k}', ''
    if g == 'glass':
        if k == 'blur': return 'effect.glass.blur', ''
        if k == 'saturate': return 'effect.glass.saturate', ''
        if k == 'edge': return 'color.border.glass', ''
        return f'color.background.glass.{"default" if k == "bg" else k}', ''
    if g == 'space': return f'space.{k}', ''
    if g == 'gutter': return f'space.gutter.{k}', ''
    if g == 'radius': return f'radius.{k}', ''
    if g == 'control':
        if k == 'hit': return 'size.target.min', ''
        return f'size.control.{strip("h", k)}', ''
    if g == 'avatar': return f'size.avatar.{k}', ''
    if g == 'icon':
        if k.startswith('stroke'): return f'size.stroke.{lower(k[6:]) or "default"}', 'an icon\'s line weight'
        return f'size.icon.{lower(k[4:]) or "default"}', ''
    if g == 'dot': return f'size.dot.{lower(k[4:]) or "default"}', ''
    if g == 'row':
        if k == 'textGap': return 'space.rowText', 'a gap, so it is a space'
        return f'size.row.{lower(k[1:]) or "default"}', ''
    if g == 'text':
        if k.endswith('Line'): return f'font.lineHeight.{k[:-4]}', ''
        return f'font.size.{k}', ''
    if g == 'font':
        if k.startswith('weight'): return f'font.weight.{strip("weight", k)}', ''
        if k.startswith('file'):
            m = re.fullmatch(r'file(Sans|Display)(\w+)', k)
            return f'font.file.{m.group(1).lower()}.{lower(m.group(2))}', ''
        return f'font.family.{k}', ''
    if g == 'tracking': return f'font.letterSpacing.{k}', ''
    if g == 'duration': return f'motion.duration.{k}', ''
    if g == 'ease': return f'motion.easing.{k}', ''
    if g == 'z': return f'zIndex.{k}', ''
    if g == 'opacity': return f'opacity.{k}', ''
    if g == 'shadow': return f'elevation.shadow.{k}', ''
    # the profile's chrome
    LAYOUT = {('rail', 'wNav'): 'rail', ('rail', 'wSidebar'): 'sidebar', ('breadcrumb', 'h'): 'breadcrumbs', ('topbar', 'h'): 'topBar', ('topbar', 'searchMaxW'): 'topBarSearchMax',
              ('topbar', 'searchMinW'): 'topBarSearchMin', ('tabbar', 'h'): 'tabBar', ('statusbar', 'h'): 'statusBar', ('statusbar', 'hAndroid'): 'statusBarAndroid',
              ('homeIndicator', 'h'): 'homeIndicator', ('phone', 'cardW'): 'phoneCard'}
    if (g, k) in LAYOUT:
        note = 'a platform in a name: should become the Android value of size.layout.statusBar (a value change, so later)' if k == 'hAndroid' else ''
        return f'size.layout.{LAYOUT[(g, k)]}', note
    return None

# ---------- component groups ----------
COMPONENT_ID = {'palette': 'commandPalette', 'workspace': 'workspaceSwitcher', 'sidebar': 'sidebarSection', 'thinking': 'thinkingIndicator', 'tab': 'tabs', 'emoji': 'contextMenu'}
# suffix word(s) → property, tried longest first
PROPS = [
    (('Max', 'H'), 'maxHeight'), (('Min', 'H'), 'minHeight'), (('Max', 'W'), 'maxWidth'), (('Min', 'W'), 'minWidth'),
    (('Pad', 'X'), 'paddingX'), (('Pad', 'Y'), 'paddingY'), (('Pad', 'Left'), 'paddingLeft'), (('Pad', 'Top'), 'paddingTop'),
    (('Hang', 'X'), 'offsetX'), (('Hang', 'Y'), 'offsetY'), (('Font', 'Size'), 'fontSize'),
    (('H',), 'height'), (('W',), 'width'), (('Size',), 'size'), (('Radius',), 'radius'), (('Gap',), 'gap'), (('Pad',), 'padding'), (('Inset',), 'inset'),
    (('Line',), 'lineHeight'), (('Top',), 'offsetY'), (('Left',), 'offsetX'), (('Right',), 'offsetX'), (('Pull',), 'offsetX'), (('Nudge',), 'offsetY'),
    (('Travel',), 'travel'), (('Dash',), 'dash'), (('Hang',), 'offset'), (('X',), 'paddingX'),
]
PLATFORMS = ['mac', 'win', 'linux', 'browser', 'ios', 'android']
VARIANT_TAIL = ['Sm', 'Md', 'Lg', 'Xl', 'Xs', 'Coarse', 'Open', 'Context', 'Form', 'Dense']

def component(group, key, typ):
    cid = COMPONENT_ID.get(group, group)
    ws = [w[:1].upper() + w[1:] for w in words(key)]
    note = []
    platform = None
    if ws and ws[0].lower() in PLATFORMS and len(ws) > 1:
        platform = ws.pop(0).lower()
    variant = []
    while len(ws) > 1 and ws[-1] in VARIANT_TAIL:
        variant.insert(0, lower(ws.pop()))
    prop = None
    for pat, name in PROPS:
        if tuple(ws[-len(pat):]) == pat and (len(ws) >= len(pat)):
            prop, ws = name, ws[:-len(pat)]
            break
    if group == 'emoji':
        ws = ['Emoji'] + (ws if key == 'grid' else [])
        prop = 'fontSize'; variant = []
    if typ == 'color' and prop is None:
        prop = 'color'
    if typ == 'shadow': prop = 'shadow'
    if typ == 'fontFamily':
        prop = 'fontFamily' if not key.startswith('file') else 'fontFile'
        if key.startswith('file'): ws = []; variant = [lower(key[4:])]
        else: ws = []
    confident = prop is not None
    if prop is None:
        prop = 'size'
        note.append('no property word in the old name: "size" is a guess')
    part = lower(''.join(ws)) if ws else ''
    if (group, key) in HAND:
        cid2, flat = HAND[(group, key)]
        return (f'{cid2}.{flat}' if MODE == 'flat' else 'component.' + cid2 + '.' + flat), 'chosen by hand: the old name had no property word', True
    segs = ([part] if part else []) + [prop] + variant + ([platform] if platform else [])
    if MODE == 'flat':
        return cid + '.' + lower(''.join(x[:1].upper() + x[1:] for x in segs)), '; '.join(note), confident
    return '.'.join(['component', cid] + segs), '; '.join(note), confident

MODE = 'nested' if '--nested' in sys.argv else 'flat'
H = lambda cid, **kw: {(g, k): (cid, v) for (g, k), v in kw.items()}
HAND = {}
def hand(group, cid, **keys):
    for k, v in keys.items(): HAND[(group, k)] = (cid, v)
hand('sheet', 'sheet', contentMin='contentMinHeight')
hand('notificationItem', 'notificationItem', kindBadge='kindBadgeSize', tile='tileSize')
hand('permissionPrompt', 'permissionPrompt', lock='lockSize', tile='tileSize')
hand('breadcrumbs', 'breadcrumbs', recordingDot='recordingDotSize')
hand('navRail', 'navRail', item='itemSize', logo='logoSize', logoGlyph='logoFontSize')
hand('workspace', 'workspaceSwitcher', tileEdge='tileRingWidth')
hand('tabBar', 'tabBar', itemSqueezed='itemSizeSqueezed')
hand('palette', 'commandPalette', slot='slotSize')
hand('contextMenu', 'contextMenu', sceneOffset='sceneOffsetX')
hand('dialog', 'dialog', icon='iconSize')
hand('hoverCard', 'hoverCard', avatar='avatarSize', presenceDot='presenceDotSize')
hand('tooltip', 'tooltip', kbdLabel='kbdFontSize')
hand('sessionState', 'sessionState', tile='tileSize')
hand('updateBanner', 'updateBanner', button='buttonSize', versionTile='versionTileSize')
hand('thinking', 'thinkingIndicator', cell='cellSize')
hand('agentSteps', 'agentSteps', marker='markerSize', icon='iconSize')
hand('chart', 'chart', endLabelRoom='endLabelWidth', activeRing='activeRingWidth', edge='edgeInset', labelBand='labelBandHeight', sliceLift='sliceInset', gaugeCap='gaugeCapRadius', tickOver='tickOverhang', pointR='pointRadius')
hand('kpi', 'kpi', loadS='loadWidthSm', loadM='loadWidthMd', loadL='loadWidthLg', loadXl='loadWidthXl')
hand('table', 'table', loadS='loadWidthSm', loadM='loadWidthMd', loadL='loadWidthLg', loadCardS='loadCardWidthSm', loadCardL='loadCardWidthLg', cardsBelow='cardsBreakpoint')
hand('button', 'button', labelSm='labelFontSizeSm', labelMd='labelFontSizeMd', labelLg='labelFontSizeLg', iconSm='iconSizeSm', iconMd='iconSizeMd', iconLg='iconSizeLg')
INTERNAL = {'osBadge', 'osNotification', 'osTray', 'osMenu', 'osWindow', 'osHeader', 'os'}

rows = []
for p, n, t in TOK:
    old = '.'.join(p)
    group, key = p[0], p[1]
    ext = n['$extensions'][EXT]
    tier, internal = ext['tier'], ext.get('visibility') == 'internal'
    if group in INTERNAL:
        rows.append(dict(old=old, new=old, tier=tier, status='internal', note='internal: left as it is in this pass'))
        continue
    sem = semantic(group, key, t)
    if sem:
        rows.append(dict(old=old, new=sem[0], tier=tier, status='same' if sem[0] == old else 'rename', note=sem[1]))
        continue
    new, note, confident = component(group, key, t)
    rows.append(dict(old=old, new=new, tier=tier, status=('same' if new == old else 'rename') if confident else 'decide', note=note))

# ---------- collisions ----------
news = collections.Counter(r['new'] for r in rows)
olds = {r['old'] for r in rows}
newset = {r['new'] for r in rows}
def prefixes(path):
    parts = path.split('.')
    return {'.'.join(parts[:i]) for i in range(1, len(parts))}
new_groups = set().union(*[prefixes(r['new']) for r in rows])
old_groups = set().union(*[prefixes(r['old']) for r in rows])
for r in rows:
    problems = []
    if news[r['new']] > 1: problems.append('two tokens would share this name')
    if r['new'] in new_groups: problems.append('this name is also a group of other new names')
    if r['status'] != 'same' and r['status'] != 'internal':
        if r['new'] in olds and r['new'] != r['old']: problems.append(f'another token has this name today')
        if r['new'] in old_groups: problems.append('this name is a group today, so t.<old group> and the new token cannot both exist')
        if r['old'] in new_groups: problems.append('the old name becomes a group of new names, so t.<old> cannot stay as a deprecated value')
    r['problems'] = problems

json.dump({r['old']: {k: r[k] for k in ('new', 'tier', 'status', 'note', 'problems')} for r in rows}, open(ROOT + 'reports/migration/tokens-2.json', 'w'), indent=1)
c = collections.Counter(r['status'] for r in rows)
bad = [r for r in rows if r['problems']]
print(c, 'collisions', len(bad))
for r in bad[:60]: print(' ', r['old'], '→', r['new'], '|', '; '.join(r['problems']))
if '-v' in sys.argv:
    for r in rows:
        if r['status'] in ('decide',): print('DECIDE', r['old'], '→', r['new'])

# ---------- the review table ----------
by = collections.OrderedDict()
for r in rows: by.setdefault(r['old'].split('.')[0], []).append(r)
kebab = lambda s: re.sub(r'([a-z0-9])([A-Z])', r'\1-\2', s.replace('.', '-')).lower()
out = ['# Token names for 2.0: proposed', '',
       'Every token, with the name it would take under the category-first standard. Nothing here is applied yet: this table is for review.',
       'Generated from `packages/core/tokens.json`; `tokens-2.json` beside it is the same data for the codemod.', '',
       f'**{c["rename"]} renamed · {c["same"]} keep their name · {c["internal"]} internal, left as they are · {len(bad)} collisions**', '',
       '## The rules', '',
       '- A **semantic** token is `category.property.role`: `color.text.muted`, `size.control.md`, `font.size.body`.',
       '- A **component** token is `componentId.partPropertyVariant`, one camelCase key in full words: `chip.removeSize`, `select.panelMaxHeight`, `chart.gridColor`.',
       '  The group is the camelCase of the component\'s docs id, or a registered family several components share (`chart`, `kpi`, `choice`, `sheet`).',
       '- The CSS variable is `--af-` plus the path in kebab case: `color.text.muted` is `--af-color-text-muted`.',
       '- Old names keep working through 1.x as deprecated aliases and leave in 2.0.', '',
       '## Open decisions', '',
       '1. **Internal tokens** (`os`, `osBadge`, `osNotification`, `osTray`, `osMenu`, `osWindow`, `osHeader`: 159) are not renamed in this pass. They are not documented, so renaming them buys little. Say so if they should follow the grammar too.',
       '2. **`statusbar.hAndroid`** carries a platform in its name. It becomes `size.layout.statusBarAndroid` for now; folding it into the Android value of `size.layout.statusBar` changes a value, so it is a separate change.',
       '3. **Rows marked "chosen by hand"** had no property word in the old name (`dialog.icon`, `kpi.loadS`); the new name states one. Check them.',
       '4. **Role words that change meaning**: `brand.active` → `…brand.pressed`, `border.active` → `color.border.selected`, `tabs.track` → `color.background.track`, `row.textGap` → `space.rowText`.', '']
for g, rs in by.items():
    out += [f'## `{g}`', '', '| Old | New | CSS variable | Tier | Note |', '|---|---|---|---|---|']
    for r in rs:
        new = r['new'] if r['status'] != 'same' and r['status'] != 'internal' else '(same)'
        var = f'`--af-{kebab(r["new"])}`' if new != '(same)' else ''
        note = '; '.join([x for x in [r['note'], *r['problems']] if x and not x.startswith('internal')]) if r['status'] != 'internal' else 'internal'
        out.append(f'| `{r["old"]}` | {"`" + new + "`" if new != "(same)" else new} | {var} | {r["tier"]} | {note} |')
    out.append('')
if MODE == 'flat': open(ROOT + 'reports/migration/tokens-2.md', 'w').write('\n'.join(out))
