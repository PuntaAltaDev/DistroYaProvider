import { useState } from 'react';

import type { RegistroForm } from '@/features/registro/validacion';
import {
  diasRestantes,
  estadoDe,
  fechaCorta,
  historialDePrueba,
  suscripcionDePrueba,
  sumarAlHistorial,
  type ArchivoLista,
} from '@/features/suscripcion/datos';
import { SuscripcionScreen } from '@/features/suscripcion/suscripcion-screen';

import { InicioScreen } from './inicio-screen';
import { ListaScreen } from './lista-screen';
import { PerfilScreen } from './perfil-screen';

type Pantalla = 'inicio' | 'perfil' | 'plan' | 'lista';

type PanelProveedorProps = {
  form: RegistroForm;
  /** La lista que subió en el registro, si la subió. */
  listaInicial?: ArchivoLista;
  /** Guarda los cambios del perfil. */
  alGuardarPerfil: (form: RegistroForm) => void;
};

/**
 * El panel del proveedor ya aprobado: inicio con tres accesos (perfil, plan y lista de precios).
 * Por ahora el plan y el historial de listas son datos de prueba, hasta que esté la API.
 */
export function PanelProveedor({ form, listaInicial, alGuardarPerfil }: PanelProveedorProps) {
  const [pantalla, setPantalla] = useState<Pantalla>('inicio');
  const [suscripcion] = useState(suscripcionDePrueba);
  const [lista, setLista] = useState<ArchivoLista | undefined>(listaInicial);
  const [historial, setHistorial] = useState<ArchivoLista[]>(historialDePrueba);

  const volver = () => setPantalla('inicio');

  /** La lista vigente pasa al historial y la nueva queda como actual. */
  const subirLista = (nueva: ArchivoLista) => {
    if (lista) setHistorial((h) => sumarAlHistorial(lista, h));
    setLista(nueva);
  };

  if (pantalla === 'perfil') {
    return <PerfilScreen form={form} alVolver={volver} alGuardar={alGuardarPerfil} />;
  }
  if (pantalla === 'plan') {
    return <SuscripcionScreen suscripcion={suscripcion} alVolver={volver} />;
  }
  if (pantalla === 'lista') {
    return <ListaScreen actual={lista} historial={historial} alSubir={subirLista} alVolver={volver} />;
  }

  const estado = estadoDe(suscripcion);
  const dias = diasRestantes(suscripcion);

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
          detalle:
            estado === 'vencida'
              ? 'Venció. Escribinos para renovarlo.'
              : `Vence el ${fechaCorta(suscripcion.endDate)} · ${dias === 1 ? 'falta 1 día' : `faltan ${dias} días`}`,
          aviso: estado !== 'activa',
          onPress: () => setPantalla('plan'),
        },
        {
          titulo: 'Lista de precios',
          detalle: lista ? `${lista.nombre} · ${fechaCorta(lista.fecha)}` : 'Todavía no subiste tu lista',
          aviso: !lista,
          onPress: () => setPantalla('lista'),
        },
      ]}
    />
  );
}
