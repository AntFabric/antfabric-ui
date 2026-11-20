import { BottomSheet, Card, Dialog } from '@antfabric/ui-react';
import { Card as NativeCard } from '@antfabric/ui-react-native';

const Panel = Card;

export function Cards({ rows, show, node }: { rows: string[]; show: boolean; node: React.ReactNode }) {
  return (
    <>
      <Card>
        <p>One line</p>
      </Card>
      <Card pad="none">
        <p>With a prop</p>
      </Card>
      <Card
        pad="none"
      >
        <div>
          <h3>Multi-line</h3>
          <p>Two lines</p>
        </div>
      </Card>
      <Card
        level="pane"
      >
        <>
          <p>A fragment</p>
        </>
      </Card>
      <Card>
        {node}
      </Card>
      <Card>
        {show ? <p>yes</p> : null}
      </Card>
      <Card>
        {rows.map((r) => <p key={r}>{r}</p>)}
      </Card>
      <Card>
        {"plain text"}
      </Card>
      <Card>
        <p>Closing tag</p>
      </Card>
      <Card content={<p>Hello</p>}>
        {/* children and content together */}
        <span>extra</span>
      </Card>
      <Panel>
        <p>Through a local alias</p>
      </Panel>
      <Dialog
        title="Rename"
        kind="form"
        confirmLabel="Save"
        onConfirm={() => undefined}
      >
        <Card>
          <div>
            <p>A card inside a dialog</p>
          </div>
        </Card>
      </Dialog>
      <BottomSheet title="Share">
        <p>Sheet body</p>
      </BottomSheet>
    </>
  );
}

export function Native() {
  return <NativeCard>
    <p>Phone</p>
  </NativeCard>;
}
