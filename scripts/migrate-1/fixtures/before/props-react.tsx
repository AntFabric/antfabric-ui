import { useState } from 'react';
import { Checkbox, RadioGroup, SearchField, SegmentedControl, Select, Switch, Tabs, TextField } from '@antfabric-ui/react';

const SEGMENTS = [{ id: 'day', label: 'Day' }];

export function Form({ setName, setQuery, clear }: { setName: (v: string) => void; setQuery: (v: string) => void; clear: () => void }) {
  const [role, setRole] = useState('a');
  return (
    <>
      <TextField label="Name" value="" onChange={setName} />
      <TextField label="Email" value="" onChange={(value) => setName(value.trim())} />
      <input onChange={() => clear()} />
      <Checkbox label="Remember me" checked onChange={(checked) => setRole(checked ? 'a' : 'b')} />
      <Switch label="Notifications" checked={false} onChange={() => clear()} />
      <SearchField value="" onChange={setQuery} onClear={clear} />
      <Select
        label="Role"
        items={[
          { id: 'a', label: 'Admin' },
          { id: 'b', label: 'Member', icon: 'user' },
        ]}
        value={role}
        onChange={setRole}
        activeId="a"
      />
      <Tabs items={[{ id: 'one', label: 'One' }, { id: 'two', label: 'Two' }]} value="one" onChange={setRole} />
      <SegmentedControl items={SEGMENTS} value="day" onChange={setRole} />
      <SegmentedControl items={SEGMENTS.map((s) => ({ id: s.id, label: s.label }))} value="day" onChange={setRole} />
      <RadioGroup
        options={[
          { value: 'x', label: 'Ex' },
          { value: role, label: 'Dynamic' },
        ]}
        value="x"
        onChange={setRole}
      />
    </>
  );
}
