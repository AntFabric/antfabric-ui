import { Chip, IconButton, ListItem, Message } from '@antfabric/ui-react';
import { ReactionPill, ThreadSummary } from '@antfabric/ui-react';
import { CommandPalette, MessageActions, TitleBar, TrayMenu } from '@antfabric/ui-react';

function toggle(on: boolean) {
  return on;
}
function press() {
  return 1;
}

export function Events({ onClose, onSelect, setOn }: { onClose: () => void; onSelect: (k: string) => void; setOn: (b: boolean) => void }) {
  return (
    <>
      <Chip label="Design" onPress={(selected) => setOn(selected)} />
      <Chip label="Design" onPress={() => setOn(true)} />
      <IconButton icon="star" label="Star" toggle onPress={(active) => setOn(active)} />
      <IconButton icon="star" label="Star" onPress={() => onClose()} />
      <IconButton icon="x" label="Close" onPress={onClose} />
      <IconButton icon="star" label="Star" onPress={toggle} />
      <IconButton icon="star" label="Star" onPress={press} />
      <IconButton icon="star" label="Star" onPress={onSelect} />
      <ListItem title="Row" onPress={(selected) => setOn(selected)} />
      <ReactionPill emoji="👍" onPress={(mine) => setOn(mine)} />
      <ThreadSummary replyCount={4} onPress={(following) => setOn(following)} />
      <Message author="Ada" onRetry={(status) => status} />
      <CommandPalette onQuery={(q) => q} onAskFabric={() => undefined} />
      <MessageActions canReact canReplyInThread={false} hasMore onMore={(open) => setOn(open)} />
      <TitleBar onSidebarToggle={(open) => setOn(open)} onMenu={(open) => setOn(open)} />
      <TrayMenu open="pause-notifications" onOpenChange={(open) => open} />
    </>
  );
}
