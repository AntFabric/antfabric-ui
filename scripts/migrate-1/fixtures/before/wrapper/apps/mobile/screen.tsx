import { Checkbox, MobileHeader, ThemeProvider, type Theme } from '@acme/ui-kit/native';

export function Screen({ scheme }: { scheme: Theme }) {
  return (
    <ThemeProvider scheme={scheme}>
      <MobileHeader title="Inbox" />
      <Checkbox label="Done" checked onChange={() => undefined} />
    </ThemeProvider>
  );
}
