import { Redirect, router } from 'expo-router';

import { useAbrirAvisoTocado } from '@/features/avisos/abrir-aviso-tocado';
import { avisosDe, sinLeer } from '@/features/avisos/avisos';
import { useCuenta } from '@/features/cuenta/cuenta-provider';
import {
  desdeGuardada,
  diasRestantes,
  estadoDe,
  fechaCorta,
  type Suscripcion,
} from '@/features/suscripcion/datos';

import { InicioScreen } from './inicio-screen';
import { useListas } from './listas';

/** Lo que dice "Mi plan" en el inicio. */
function detallePlan(suscripcion: Suscripcion | undefined) {
  if (!suscripcion) return 'Elegí tu plan para aparecer en el buscador';
  if (estadoDe(suscripcion) === 'vencida') return 'Venció. Renovalo para volver al buscador.';
  const dias = diasRestantes(suscripcion);
  return `Vence el ${fechaCorta(suscripcion.endDate)} · ${dias === 1 ? 'falta 1 día' : `faltan ${dias} días`}`;
}

/** Inicio del panel: un acceso por sección, cada uno con su dato más útil. */
export function PanelInicio() {
  const { cuenta } = useCuenta();
  const { actual: lista } = useListas();
  const suscripcion = desdeGuardada(cuenta.suscripcion);
  const nuevos = sinLeer(avisosDe(cuenta), cuenta.avisos?.leidos);
  useAbrirAvisoTocado();

  // Tiene plan pero nunca se le preguntó por los avisos (ej.: cerró la app en esa pantalla).
  if (suscripcion && !cuenta.avisos) return <Redirect href="/panel/permiso-avisos" />;

  return (
    <InicioScreen
      nombre={cuenta.form.razonSocial.trim()}
      accesos={[
        {
          titulo: 'Mi perfil',
          detalle: 'Logo, contacto, dirección y rubros',
          onPress: () => router.push('/panel/perfil'),
        },
        {
          titulo: 'Mi plan',
          detalle: detallePlan(suscripcion),
          aviso: !suscripcion || estadoDe(suscripcion) !== 'activa',
          // Sin plan, lleva directo a elegir uno.
          onPress: () => router.push(suscripcion ? '/panel/plan' : '/panel/planes'),
        },
        {
          titulo: 'Lista de precios',
          detalle: lista
            ? `${lista.nombre} · ${fechaCorta(lista.fecha)}`
            : 'Todavía no subiste tu lista',
          aviso: !lista,
          onPress: () => router.push('/panel/lista'),
        },
        {
          titulo: 'Avisos',
          detalle:
            nuevos.length === 0
              ? 'Nada nuevo'
              : nuevos.length === 1
                ? `Nuevo: ${nuevos[0].titulo}`
                : `${nuevos.length} avisos nuevos`,
          aviso: nuevos.length > 0,
          onPress: () => router.push('/panel/avisos'),
        },
        {
          titulo: 'Ajustes',
          detalle: 'Apariencia, avisos, cuenta, ayuda y legal',
          onPress: () => router.push('/panel/ajustes'),
        },
      ]}
    />
  );
}
