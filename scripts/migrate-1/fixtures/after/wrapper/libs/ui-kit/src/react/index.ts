// The wrapper's web entry.
import '@antfabric/ui-core/fonts.css';

export * from '@antfabric/ui-react';
export * from '@antfabric/ui-react/shell';
export * from '@antfabric/ui-react/chat';
export {
  brandVars,
  initials,
  themes,
  tokensCss,
  type BrandTokens,
  type OS as Os,
  type Scheme,
} from '@antfabric/ui-core';
export type {
  AvatarIdentity as Identity,
  NavItem as NavDestination,
  TabsItem as TabItem,
} from '@antfabric/ui-react';
export const KIT_NAME = 'acme';
