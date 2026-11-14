import { useState } from 'react';

import { AjustesScreen } from '@/features/ajustes/ajustes-screen';
import { avisosDe, sinLeer } from '@/features/avisos/avisos';
import { AvisosScreen } from '@/features/avisos/avisos-screen';
import { PermisoAvisosScreen } from '@/features/avisos/permiso-avisos-screen';
import { useCuenta } from '@/features/cuenta/cuenta-provider';
import {
  aGuardada,
  desdeGuardada,
  diasRestantes,
  estadoDe,
  fechaCorta,
  historialDePrueba,
  sumarAlHistorial,
  type ArchivoLista,
  type Suscripcion,
} from '@/features/suscripcion/datos';
import { contratar } from '@/features/suscripcion/planes';
import { PlanesScreen } from '@/features/suscripcion/planes-screen';
import { SuscripcionScreen } from '@/features/suscripcion/suscripcion-screen';

import { InicioScreen } from './inicio-screen';
import { ListaScreen } from './lista-screen';
import { PerfilScreen } from './perfil-screen';

type Pantalla = 'inicio' | 'perfil' | 'plan' | 'planes' | 'lista' | 'avisos' | 'ajustes';

/** Lo que dice "Mi plan" en el inicio. */
function detallePlan(suscripcion: Suscripcion | undefined) {
  if (!suscripcion) return 'Elegí tu plan para aparecer en el buscador';
  if (estadoDe(suscripcion) === 'vencida') return 'Venció. Renovalo para volver al buscador.';
  const dias = diasRestantes(suscripcion);
  return `Vence el ${fechaCorta(suscripcion.endDate)} · ${dias === 1 ? 'falta 1 día' : `faltan ${dias} días`}`;
}

/**
 * El panel del proveedor ya aprobado: inicio con sus accesos (perfil, plan, lista de precios
 * y ajustes). El plan se guarda en la cuenta; el historial de listas es de prueba hasta que esté la API.
 */
export function PanelProveedor() {
  const { cuenta, actualizar } = useCuenta();
  const form = cuenta.form;
  const suscripcion = desdeGuardada(cuenta.suscripcion);

  const [pantalla, setPantalla] = useState<Pantalla>('inicio');
  // La lista que subió en el registro, si la subió.
  const [lista, setLista] = useState<ArchivoLista | undefined>(() =>
    form.catalogo && cuenta.fechaEnvio
      ? {
          nombre: form.catalogo.name,
          tamano: form.catalogo.size,
          fecha: new Date(cuenta.fechaEnvio),
        }
      : undefined,
  );
  const [historial, setHistorial] = useState<ArchivoLista[]>(historialDePrueba);

  const avisos = avisosDe(cuenta);
  const leidos = cuenta.avisos?.leidos ?? [];
  const nuevos = sinLeer(avisos, leidos);
  // Los que eran nuevos al abrir la bandeja siguen marcados mientras está abierta.
  const [marcados, setMarcados] = useState<string[]>([]);

  const volver = () => setPantalla('inicio');

  const abrirAvisos = () => {
    setMarcados(nuevos.map((a) => a.id));
    actualizar((actual) => ({
      avisos: { activos: actual.avisos?.activos ?? false, leidos: avisos.map((a) => a.id) },
    }));
    setPantalla('avisos');
  };

  // Después de contratar el primer plan, una sola vez: para qué son los avisos y el permiso.
  if (suscripcion && !cuenta.avisos) {
    return (
      <PermisoAvisosScreen alResponder={(activos) => actualizar({ avisos: { activos, leidos } })} />
    );
  }

  /** La lista vigente pasa al historial y la nueva queda como actual. */
  const subirLista = (nueva: ArchivoLista) => {
    if (lista) setHistorial((h) => sumarAlHistorial(lista, h));
    setLista(nueva);
  };

  if (pantalla === 'perfil') {
    return (
      <PerfilScreen
        form={form}
        alVolver={volver}
        // Todavía no hay servidor: el perfil se guarda en el teléfono. Acá va la llamada a la API.
        alGuardar={(nuevo) => actualizar({ form: nuevo })}
      />
    );
  }
  if (pantalla === 'plan' && suscripcion) {
    return (
      <SuscripcionScreen
        suscripcion={suscripcion}
        alRenovar={() => setPantalla('planes')}
        alVolver={volver}
      />
    );
  }
  // Sin plan, "Mi plan" lleva directo a elegir uno.
  if (pantalla === 'planes' || pantalla === 'plan') {
    return (
      <PlanesScreen
        actual={suscripcion}
        alVolver={() => setPantalla(suscripcion ? 'plan' : 'inicio')}
        alContratar={(plan) => {
          // Con la API, la suscripción nueva la devuelve el servidor después del pago.
          actualizar({ suscripcion: aGuardada(contratar(plan, suscripcion)) });
          setPantalla('plan');
        }}
      />
    );
  }
  if (pantalla === 'lista') {
    return (
      <ListaScreen actual={lista} historial={historial} alSubir={subirLista} alVolver={volver} />
    );
  }
  if (pantalla === 'avisos') {
    return (
      <AvisosScreen avisos={avisos} nuevos={marcados} alAbrir={setPantalla} alVolver={volver} />
    );
  }
  if (pantalla === 'ajustes') {
    return <AjustesScreen alVolver={volver} />;
  }

  return (
    <InicioScreen
      nombre={form.razonSocial.trim()}
      accesos={[
        {
          titulo: 'Mi perfil',
          detalle: 'Logo, contacto, dirección y rubros',
          onPress: () => setPantalla('perfil'),
        },
        {
          titulo: 'Mi plan',
          detalle: detallePlan(suscripcion),
          aviso: !suscripcion || estadoDe(suscripcion) !== 'activa',
          onPress: () => setPantalla('plan'),
        },
        {
          titulo: 'Lista de precios',
          detalle: lista
            ? `${lista.nombre} · ${fechaCorta(lista.fecha)}`
            : 'Todavía no subiste tu lista',
          aviso: !lista,
          onPress: () => setPantalla('lista'),
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
          onPress: abrirAvisos,
        },
        {
          titulo: 'Ajustes',
          detalle: 'Apariencia, avisos, cuenta y legal',
          onPress: () => setPantalla('ajustes'),
        },
      ]}
    />
  );
}
