import { ThemeProvider } from '@antfabric/ui-react-native';
import { resolveTokens, defineTheme, themes } from '@antfabric/ui-core';
import type { ReactNode } from 'react';

const BRAND = { primary: '#0a7' };

export function Providers({ scheme, children }: { scheme: 'light' | 'dark'; children: ReactNode }) {
  return (
    <ThemeProvider scheme={scheme} theme={defineTheme({ name: "app", extends: themes.antfabric, brand: BRAND })}>
      {children}
    </ThemeProvider>
  );
}

export function Bare({ children }: { children: ReactNode }) {
  return <ThemeProvider theme={themes.antfabric}>{children}</ThemeProvider>;
}

export const tokens = resolveTokens('mobile', 'dark', { theme: defineTheme({ name: "app", extends: themes.antfabric, brand: BRAND }) });
export const plain = resolveTokens('mobile', 'dark', { os: 'ios' });
