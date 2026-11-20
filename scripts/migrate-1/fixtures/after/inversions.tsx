import { Breadcrumbs, QuestionPanel, UpdateBanner } from '@antfabric/ui-react';
import { SidebarSection } from '@antfabric/ui-react/shell';
import { TabBar } from '@antfabric/ui-react-native/shell';

export function Bars({ shut, setShut, items }: { shut: boolean; setShut: (v: boolean) => void; items: never[] }) {
  return (
    <>
      <Breadcrumbs items={items} expanded={false} />
      <Breadcrumbs items={items} expanded={false} />
      <Breadcrumbs items={items} expanded />
      <Breadcrumbs items={items} expanded={!(shut)} />
      <Breadcrumbs items={items} expanded={shut} />
      <Breadcrumbs items={items} expanded={!(shut && items.length > 3)} />
      <QuestionPanel title="Approve?" expanded={!(shut)} onExpandedChange={() => setShut(true)} />
      <QuestionPanel title="Approve?" expanded={!(shut)} onCollapsedChange={(c) => setShut(c)} />
      <UpdateBanner expanded={!(shut)} stage="ready" />
      <SidebarSection label="Channels" items={[]} expanded={!(shut)} onToggle={(collapsed) => setShut(collapsed)} />
      <SidebarSection label="Starred" items={[]} onExpandedChange={() => setShut(!shut)} />
    </>
  );
}

export function Tabs2({ shut }: { shut: boolean }) {
  return <TabBar tabs={[]} expanded={!(shut)} onExpandedChange={() => undefined} onActiveChange={(key) => key} onFabric={() => undefined} />;
}
