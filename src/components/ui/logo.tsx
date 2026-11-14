import Svg, { Circle, Path, Polygon, Rect } from 'react-native-svg';

import { palette } from '@/theme/tokens';

type LogoProps = {
  /** Lado del cuadrado, en puntos. */
  size?: number;
  /** Color del cuadrado de fondo. En fondo oscuro conviene uno apenas más claro que la pantalla. */
  fondo?: string;
};

/**
 * Logo de DistroYa: el carrito de compras sobre un cuadrado de esquinas redondeadas.
 * Es una marca: sus colores son fijos y no cambian con el modo claro/oscuro.
 * El mismo dibujo está en `scripts/generar-iconos.mjs`, que arma el ícono y el splash:
 * si cambia uno, cambia el otro.
 */
export function Logo({ size = 96, fondo = palette.deep900 }: LogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 130 130" accessibilityLabel="DistroYa">
      <Rect width={130} height={130} rx={30} fill={fondo} />
      <Polygon points="44,52 98,52 90,78 51,78" fill={palette.teal400} />
      <Path
        d="M26 36H40L51 78H90L98 52H44"
        fill="none"
        stroke={palette.white}
        strokeWidth={7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={58} cy={94} r={7} fill={palette.aqua} />
      <Circle cx={84} cy={94} r={7} fill={palette.aqua} />
    </Svg>
  );
}
