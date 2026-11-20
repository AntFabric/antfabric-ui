import { AgentSteps, NavRail, QuestionPanel, Select, SidebarSection, Tabs } from '@antfabric-ui/react';
import { Table } from '@antfabric-ui/react/data';

const BUILT_ELSEWHERE = [{ id: 'a', label: 'A' }];

export function Lists({ id, label, extra }: { id: string; label: string; extra: boolean }) {
  return (
    <>
      <Tabs items={BUILT_ELSEWHERE} value="a" />
      <Tabs items={[{ id, label }, ...BUILT_ELSEWHERE]} value="a" />
      <Tabs items={extra ? [{ id: 'x', label: 'X' }] : [{ id: 'y', label: 'Y' }]} value="x" />
      <Select items={[{ id: 'a', key: 'already', label: 'A' }]} value="a" />
      <Select items={[{ 'id': 'quoted', label: 'Q' }] as const} value="quoted" />
      <Table
        columns={[
          { id: 'name', label: 'Name' },
          { id: 'arr', label: 'ARR' },
        ]}
        rows={[
          { id: 'r1', name: 'Northwind', arr: 12 },
          { id: 'r2', name: 'Contoso', arr: 7 },
        ]}
      />
      <Table columns={[{ id: 'name', label: 'Name' }]} rows={[{ id: 'r1', name: 'Northwind' }]} rowKey="id" />
      <Table columns={[]} rows={BUILT_ELSEWHERE} />
      <NavRail
        destinations={[
          { id: 'chat', label: 'Chat', icon: 'messages', cap: 999 },
          {
            key: 'files',
            label: 'Files',
            icon: 'files',
            cap: 9,
            sections: [{ id: 'recent', label: 'Recent', icon: 'history', cap: 3 }],
          },
        ]}
      />
      <SidebarSection
        label="Channels"
        items={[
          { name: 'design-crit', glyph: '#' },
          { name: label, glyph: '#', onPress: () => undefined },
          { name: `dm-${id}` },
        ]}
      />
      <AgentSteps steps={[{ id: 's1', label: 'Read the doc', server: 'Drive', state: 'done' }]} />
      <QuestionPanel title="Which one?" options={[{ id: 'o1', label: 'One' }]} confirmOptionId="o1" styles={{ bar: { opacity: 1 } }} />
    </>
  );
}
