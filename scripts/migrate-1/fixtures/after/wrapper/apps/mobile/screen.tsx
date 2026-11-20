import { Checkbox, MobileHeader, ThemeProvider, type Scheme, themes } from '@acme/ui-kit/native';

export function Screen({ scheme }: { scheme: Scheme }) {
  return (
    <ThemeProvider scheme={scheme} theme={themes.antfabric}>
      <MobileHeader title="Inbox" />
      <Checkbox label="Done" checked onCheckedChange={() => undefined} />
    </ThemeProvider>
  );
}
