import { AgentSteps, QuestionPanel, Select, Tabs } from '@antfabric-ui/react';
import { NavRail, SidebarSection } from '@antfabric-ui/react/shell';
import { Table } from '@antfabric-ui/react/data';

const BUILT_ELSEWHERE = [{ id: 'a', label: 'A' }];

export function Lists({ id, label, extra }: { id: string; label: string; extra: boolean }) {
  return (
    <>
      <Tabs items={BUILT_ELSEWHERE} value="a" />
      <Tabs items={[{ key: id, label }, ...BUILT_ELSEWHERE]} value="a" />
      <Tabs items={extra ? [{ key: 'x', label: 'X' }] : [{ key: 'y', label: 'Y' }]} value="x" />
      <Select items={[{ id: 'a', key: 'already', label: 'A' }]} value="a" />
      <Select items={[{ 'key': 'quoted', label: 'Q' }] as const} value="quoted" />
      <Table
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'arr', label: 'ARR' },
        ]}
        rows={[
          { key: 'r1', name: 'Northwind', arr: 12 },
          { key: 'r2', name: 'Contoso', arr: 7 },
        ]}
      />
      <Table columns={[{ key: 'name', label: 'Name' }]} rows={[{ id: 'r1', name: 'Northwind' }]} rowKey="id" />
      <Table columns={[]} rows={BUILT_ELSEWHERE} />
      <NavRail
        destinations={[
          { key: 'chat', label: 'Chat', icon: 'messages', max: 999 },
          {
            key: 'files',
            label: 'Files',
            icon: 'files',
            max: 9,
            sections: [{ key: 'recent', label: 'Recent', icon: 'history', max: 3 }],
          },
        ]}
      />
      <SidebarSection
        label="Channels"
        items={[
          { key: 'design-crit', name: 'design-crit', glyph: '#' },
          { key: label, name: label, glyph: '#', onPress: () => undefined },
          { name: `dm-${id}` },
        ]}
      />
      <AgentSteps steps={[{ key: 's1', label: 'Read the doc', source: 'Drive', state: 'done' }]} />
      <QuestionPanel title="Which one?" options={[{ key: 'o1', label: 'One' }]} confirmOption="o1" styles={{ root: { opacity: 1 } }} />
    </>
  );
}
