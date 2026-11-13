import { SymbolView, type SymbolViewProps } from 'expo-symbols';

import { useAppTheme, type AppColors } from '@/theme';

/**
 * Íconos de la app. Cada uno tiene su versión para iPhone (SF Symbols)
 * y para Android / web (Material Symbols), así se ven nativos en cada teléfono.
 */
const ICONS = {
  back: { ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' },
  camera: { ios: 'camera', android: 'photo_camera', web: 'photo_camera' },
  check: { ios: 'checkmark', android: 'check', web: 'check' },
  document: { ios: 'doc.text', android: 'description', web: 'description' },
  upload: { ios: 'arrow.up.doc', android: 'upload_file', web: 'upload_file' },
  close: { ios: 'xmark', android: 'close', web: 'close' },
  edit: { ios: 'pencil', android: 'edit', web: 'edit' },
  clock: { ios: 'clock', android: 'schedule', web: 'schedule' },
} as const satisfies Record<string, SymbolViewProps['name']>;

export type IconName = keyof typeof ICONS;

type IconProps = {
  name: IconName;
  size?: number;
  color?: keyof AppColors;
};

export function Icon({ name, size, color = 'text' }: IconProps) {
  const { colors, sizes } = useAppTheme();
  return <SymbolView name={ICONS[name]} size={size ?? sizes.iconMd} tintColor={colors[color]} />;
}
