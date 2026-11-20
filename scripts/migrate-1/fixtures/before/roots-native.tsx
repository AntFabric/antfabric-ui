import { ThemeProvider } from '@antfabric/ui-react-native';
import { resolveTokens } from '@antfabric/ui-core';
import type { ReactNode } from 'react';

const BRAND = { primary: '#0a7' };

export function Providers({ scheme, children }: { scheme: 'light' | 'dark'; children: ReactNode }) {
  return (
    <ThemeProvider scheme={scheme} brand={BRAND}>
      {children}
    </ThemeProvider>
  );
}

export function Bare({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

export const tokens = resolveTokens('mobile', 'dark', { brand: BRAND });
export const plain = resolveTokens('mobile', 'dark', { os: 'ios' });
