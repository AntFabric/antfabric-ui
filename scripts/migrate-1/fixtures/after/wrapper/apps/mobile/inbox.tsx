import { ShellHeader } from './components/ShellHeader';

// The file imports nothing from the kit: its only link to MobileHeader is the app's own ShellHeader.
export function Inbox({ unread }: { unread: number }) {
  return (
    <>
      <ShellHeader title="Inbox" unread={unread} onBell={() => undefined} time="9:41" />
      <ShellHeader title="Settings" />
    </>
  );
}
