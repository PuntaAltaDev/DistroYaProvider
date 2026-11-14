/**
 * Búsqueda de direcciones con Google Places API (New).
 * Docs: https://developers.google.com/maps/documentation/places/web-service
 *
 * Todavía no hay servidor: la app habla directo con Google. Cuando Seba tenga la API,
 * estas dos funciones pasan a llamar a su backend y la clave deja de estar en la app.
 */

/** Dirección elegida de la lista de Google, ya separada en partes. */
export type Lugar = {
  placeId: string;
  calle: string;
  numero: string;
  localidad: string;
  provincia: string;
  codigoPostal: string;
  latitud: number;
  longitud: number;
};

export type Sugerencia = {
  placeId: string;
  /** "Belgrano 1200" */
  principal: string;
  /** "Punta Alta, Provincia de Buenos Aires" */
  secundario: string;
};

// La referencia tiene que ser estática: si no, Expo no la reemplaza al armar la app.
const CLAVE = process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY;

/** Sin clave (por ejemplo, en una compu que todavía no la tiene), la dirección se escribe a mano. */
export const PLACES_ACTIVO = !!CLAVE;

const BASE = 'https://places.googleapis.com/v1';

/** Google agrupa las búsquedas y la elección en una sola "sesión" para cobrar menos. */
export function nuevaSesion() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const n = Math.floor(Math.random() * 16);
    return (c === 'x' ? n : (n & 0x3) | 0x8).toString(16);
  });
}

/** Sugerencias para lo que el usuario va escribiendo. Solo direcciones de Argentina. */
export async function buscarDirecciones(
  texto: string,
  sesion: string,
  signal?: AbortSignal,
): Promise<Sugerencia[]> {
  const respuesta = await fetch(`${BASE}/places:autocomplete`, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': CLAVE ?? '',
      'X-Goog-FieldMask': '*',
    },
    body: JSON.stringify({
      input: texto,
      sessionToken: sesion,
      includedRegionCodes: ['ar'],
      languageCode: 'es',
    }),
  });
  if (!respuesta.ok) throw new Error(`Places autocomplete ${respuesta.status}`);

  const datos: {
    suggestions?: {
      placePrediction?: {
        placeId: string;
        text?: { text: string };
        structuredFormat?: { mainText?: { text: string }; secondaryText?: { text: string } };
      };
    }[];
  } = await respuesta.json();

  return (datos.suggestions ?? []).flatMap((s) => {
    const p = s.placePrediction;
    if (!p) return [];
    return [
      {
        placeId: p.placeId,
        principal: p.structuredFormat?.mainText?.text ?? p.text?.text ?? '',
        // Con la región fijada, Google puede omitir el segundo renglón.
        secundario: p.structuredFormat?.secondaryText?.text ?? '',
      },
    ];
  });
}

type Componente = { longText?: string; types?: string[] };

/** Trae la dirección elegida con sus partes y coordenadas. Cierra la sesión de búsqueda. */
export async function detalleDeLugar(
  placeId: string,
  sesion: string,
  signal?: AbortSignal,
): Promise<{ texto: string; lugar: Lugar }> {
  const url = `${BASE}/places/${encodeURIComponent(placeId)}?languageCode=es&sessionToken=${sesion}`;
  const respuesta = await fetch(url, {
    signal,
    headers: {
      'X-Goog-Api-Key': CLAVE ?? '',
      'X-Goog-FieldMask': 'id,addressComponents,location',
    },
  });
  if (!respuesta.ok) throw new Error(`Places details ${respuesta.status}`);

  const datos: {
    id?: string;
    addressComponents?: Componente[];
    location?: { latitude: number; longitude: number };
  } = await respuesta.json();

  const componentes = datos.addressComponents ?? [];
  const parte = (...tipos: string[]) => {
    for (const tipo of tipos) {
      const hallado = componentes.find((c) => c.types?.includes(tipo))?.longText;
      if (hallado) return hallado;
    }
    return '';
  };

  const lugar: Lugar = {
    placeId: datos.id ?? placeId,
    calle: parte('route'),
    numero: parte('street_number'),
    // En muchos pueblos Google no marca "locality": se cae al partido o al barrio.
    localidad: parte(
      'locality',
      'administrative_area_level_2',
      'sublocality',
      'sublocality_level_1',
    ),
    provincia: parte('administrative_area_level_1'),
    codigoPostal: parte('postal_code'),
    latitud: datos.location?.latitude ?? 0,
    longitud: datos.location?.longitude ?? 0,
  };

  return { texto: textoDeDireccion(lugar), lugar };
}

/** "Belgrano 1200, Punta Alta": lo que se muestra en el campo. */
export function textoDeDireccion(lugar: Lugar) {
  const calle = [lugar.calle, lugar.numero].filter(Boolean).join(' ');
  return [calle, lugar.localidad].filter(Boolean).join(', ');
}
