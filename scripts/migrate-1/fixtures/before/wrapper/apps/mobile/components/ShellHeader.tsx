import { MobileHeader, type MobileHeaderProps } from '@acme/ui-kit/native';

/** A header of the app's own: the kit's `MobileHeader` without the drawn status bar. Whatever a caller passes is MobileHeader's prop. */
export function ShellHeader({ actions = [], ...props }: Omit<MobileHeaderProps, 'statusBar'>) {
  return <MobileHeader {...props} actions={actions} statusBar={false} />;
}
