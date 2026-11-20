import { useState } from 'react';
import { Checkbox, RadioGroup, SearchField, SegmentedControl, Select, Switch, Tabs, TextField } from '@antfabric/ui-react';

const SEGMENTS = [{ id: 'day', label: 'Day' }];

export function Form({ setName, setQuery, clear }: { setName: (v: string) => void; setQuery: (v: string) => void; clear: () => void }) {
  const [role, setRole] = useState('a');
  return (
    <>
      <TextField label="Name" value="" onValueChange={setName} />
      <TextField label="Email" value="" onValueChange={(value) => setName(value.trim())} />
      <input onChange={() => clear()} />
      <Checkbox label="Remember me" checked onCheckedChange={(checked) => setRole(checked ? 'a' : 'b')} />
      <Switch label="Notifications" checked={false} onCheckedChange={() => clear()} />
      <SearchField value="" onValueChange={setQuery} onClear={clear} />
      <Select
        label="Role"
        items={[
          { key: 'a', label: 'Admin' },
          { key: 'b', label: 'Member', icon: 'user' },
        ]}
        value={role}
        onValueChange={setRole}
        activeKey="a"
      />
      <Tabs items={[{ key: 'one', label: 'One' }, { key: 'two', label: 'Two' }]} value="one" onValueChange={setRole} />
      <SegmentedControl items={SEGMENTS} value="day" onValueChange={setRole} />
      <SegmentedControl items={SEGMENTS.map((s) => ({ key: s.id, label: s.label }))} value="day" onValueChange={setRole} />
      <RadioGroup
        options={[
          { key: 'x', label: 'Ex' },
          { key: role, label: 'Dynamic' },
        ]}
        value="x"
        onValueChange={setRole}
      />
    </>
  );
}
