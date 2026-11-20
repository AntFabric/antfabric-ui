import { Breadcrumbs, QuestionPanel, UpdateBanner } from '@antfabric/ui-react';
import { SidebarSection } from '@antfabric/ui-react';
import { TabBar } from '@antfabric/ui-react-native';

export function Bars({ shut, setShut, items }: { shut: boolean; setShut: (v: boolean) => void; items: never[] }) {
  return (
    <>
      <Breadcrumbs items={items} collapsed />
      <Breadcrumbs items={items} collapsed={true} />
      <Breadcrumbs items={items} collapsed={false} />
      <Breadcrumbs items={items} collapsed={shut} />
      <Breadcrumbs items={items} collapsed={!shut} />
      <Breadcrumbs items={items} collapsed={shut && items.length > 3} />
      <QuestionPanel title="Approve?" collapsed={shut} onCollapsedChange={() => setShut(true)} />
      <QuestionPanel title="Approve?" collapsed={shut} onCollapsedChange={(c) => setShut(c)} />
      <UpdateBanner collapsed={shut} stage="ready" />
      <SidebarSection label="Channels" items={[]} collapsed={shut} onToggle={(collapsed) => setShut(collapsed)} />
      <SidebarSection label="Starred" items={[]} onToggle={() => setShut(!shut)} />
    </>
  );
}

export function Tabs2({ shut }: { shut: boolean }) {
  return <TabBar tabs={[]} collapsed={shut} onExpand={() => undefined} onTab={(key) => key} onFabric={() => undefined} />;
}
