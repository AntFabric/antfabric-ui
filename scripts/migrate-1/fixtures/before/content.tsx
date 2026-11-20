import { BottomSheet, Card, Dialog } from '@antfabric-ui/react';
import { Card as NativeCard } from '@antfabric-ui/react-native';

const Panel = Card;

export function Cards({ rows, show, node }: { rows: string[]; show: boolean; node: React.ReactNode }) {
  return (
    <>
      <Card content={<p>One line</p>} />
      <Card pad="none" content={<p>With a prop</p>} />
      <Card
        pad="none"
        content={
          <div>
            <h3>Multi-line</h3>
            <p>Two lines</p>
          </div>
        }
      />
      <Card
        content={
          <>
            <p>A fragment</p>
          </>
        }
        level="pane"
      />
      <Card content={node} />
      <Card content={show ? <p>yes</p> : null} />
      <Card content={rows.map((r) => <p key={r}>{r}</p>)} />
      <Card content="plain text" />
      <Card content={<p>Closing tag</p>}></Card>
      <Card content={<p>Hello</p>}>
        {/* children and content together */}
        <span>extra</span>
      </Card>
      <Panel content={<p>Through a local alias</p>} />
      <Dialog
        title="Rename"
        kind="form"
        confirmLabel="Save"
        onConfirm={() => undefined}
        content={
          <Card
            content={
              <div>
                <p>A card inside a dialog</p>
              </div>
            }
          />
        }
      />
      <BottomSheet title="Share" content={<p>Sheet body</p>} />
    </>
  );
}

export function Native() {
  return <NativeCard content={<p>Phone</p>} />;
}
