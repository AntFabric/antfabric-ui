import { AntFabricProvider, AntFabricRoot } from '@antfabric-ui/react';
import type { ReactNode } from 'react';
import { defineTheme, themes } from '@antfabric-ui/core';

export function Plain({ children }: { children: ReactNode }) {
  return <AntFabricRoot platform="web" theme={themes.antfabric}>{children}</AntFabricRoot>;
}

export function Dark({ children }: { children: ReactNode }) {
  return (
    <AntFabricRoot platform="desktop" os="mac" scheme="dark" theme={themes.antfabric}>
      {children}
    </AntFabricRoot>
  );
}

export function Variable({ children, theme }: { children: ReactNode; theme: 'light' | 'dark' }) {
  return (
    <AntFabricRoot
      platform="web"
      scheme={theme}
      style={{ height: '100vh' }}
      theme={themes.antfabric}
    >
      {children}
    </AntFabricRoot>
  );
}

export function Branded({ children, primary }: { children: ReactNode; primary: string }) {
  return (
    <AntFabricRoot platform="web" theme={defineTheme({ name: "app", extends: themes.antfabric, brand: { primary } })}>
      {children}
    </AntFabricRoot>
  );
}

export function SpreadBrand({ children, primary }: { children: ReactNode; primary?: string }) {
  return (
    <AntFabricRoot platform="web" scheme="light" theme={themes.antfabric} {...(primary ? { theme: defineTheme({ name: "app", extends: themes.antfabric, brand: { primary } }) } : {})}>
      {children}
    </AntFabricRoot>
  );
}

export function Provider({ children }: { children: ReactNode }) {
  return <AntFabricProvider scheme="dark" theme={themes.antfabric}>{children}</AntFabricProvider>;
}

export function Nested({ children }: { children: ReactNode }) {
  return (
    <AntFabricRoot platform="web" theme={themes.antfabric}>
      <AntFabricRoot platform="web">{children}</AntFabricRoot>
    </AntFabricRoot>
  );
}

export function Unknown({ children, rest }: { children: ReactNode; rest: object }) {
  return (
    <AntFabricRoot platform="web" theme={themes.antfabric} {...rest}>
      {children}
    </AntFabricRoot>
  );
}
