import { Chip, IconButton, ListItem } from '@antfabric/ui-react';
import { Message } from '@antfabric/ui-react/chat';
import { ReactionPill, ThreadSummary } from '@antfabric/ui-react/chat';
import { CommandPalette } from '@antfabric/ui-react';
import { MessageActions } from '@antfabric/ui-react/chat';
import { TitleBar, TrayMenu } from '@antfabric/ui-react/shell';

function toggle(on: boolean) {
  return on;
}
function press() {
  return 1;
}

export function Events({ onClose, onSelect, setOn }: { onClose: () => void; onSelect: (k: string) => void; setOn: (b: boolean) => void }) {
  return (
    <>
      <Chip label="Design" onSelectedChange={(selected) => setOn(selected)} />
      <Chip label="Design" onPress={() => setOn(true)} />
      <IconButton icon="star" label="Star" toggle onActiveChange={(active) => setOn(active)} />
      <IconButton icon="star" label="Star" onPress={() => onClose()} />
      <IconButton icon="x" label="Close" onPress={onClose} />
      <IconButton icon="star" label="Star" onActiveChange={toggle} />
      <IconButton icon="star" label="Star" onPress={press} />
      <IconButton icon="star" label="Star" onPress={onSelect} />
      <ListItem title="Row" onSelectedChange={(selected) => setOn(selected)} />
      <ReactionPill emoji="👍" onMineChange={(mine) => setOn(mine)} />
      <ThreadSummary replyCount={4} onFollowingChange={(following) => setOn(following)} />
      <Message author="Ada" onStatusChange={(status) => status} />
      <CommandPalette onQueryChange={(q) => q} onAsk={() => undefined} ask agentName="Fabric" />
      <MessageActions addReaction replyInThread={false} more onMenuOpenChange={(open) => setOn(open)} />
      <TitleBar onSidebarExpandedChange={(open) => setOn(open)} onMenuOpenChange={(open) => setOn(open)} />
      <TrayMenu openMenu="pause-notifications" onOpenMenuChange={(open) => open} />
    </>
  );
}
