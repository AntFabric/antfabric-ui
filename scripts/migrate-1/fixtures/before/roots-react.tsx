import { AntFabricProvider, AntFabricRoot } from '@antfabric-ui/react';
import type { ReactNode } from 'react';

export function Plain({ children }: { children: ReactNode }) {
  return <AntFabricRoot platform="web">{children}</AntFabricRoot>;
}

export function Dark({ children }: { children: ReactNode }) {
  return (
    <AntFabricRoot platform="desktop" os="mac" theme="dark">
      {children}
    </AntFabricRoot>
  );
}

export function Variable({ children, theme }: { children: ReactNode; theme: 'light' | 'dark' }) {
  return (
    <AntFabricRoot
      platform="web"
      theme={theme}
      style={{ height: '100vh' }}
    >
      {children}
    </AntFabricRoot>
  );
}

export function Branded({ children, primary }: { children: ReactNode; primary: string }) {
  return (
    <AntFabricRoot platform="web" brand={{ primary }}>
      {children}
    </AntFabricRoot>
  );
}

export function SpreadBrand({ children, primary }: { children: ReactNode; primary?: string }) {
  return (
    <AntFabricRoot platform="web" theme="light" {...(primary ? { brand: { primary } } : {})}>
      {children}
    </AntFabricRoot>
  );
}

export function Provider({ children }: { children: ReactNode }) {
  return <AntFabricProvider theme="dark">{children}</AntFabricProvider>;
}

export function Nested({ children }: { children: ReactNode }) {
  return (
    <AntFabricRoot platform="web">
      <AntFabricRoot platform="web">{children}</AntFabricRoot>
    </AntFabricRoot>
  );
}

export function Unknown({ children, rest }: { children: ReactNode; rest: object }) {
  return (
    <AntFabricRoot platform="web" {...rest}>
      {children}
    </AntFabricRoot>
  );
}
