import type { AjusteLogo, ImagenLogo } from './logo';

/** Datos que completa el proveedor en el registro. */
export type RegistroForm = {
  /** El logo ya recortado (cuadrado, 512 px): es lo que se envía. */
  logoUri?: string;
  /** La foto entera que eligió, para poder volver a acomodarla. */
  logoOriginal?: ImagenLogo;
  logoAjuste?: AjusteLogo;
  razonSocial: string;
  whatsapp: string;
  telefono: string;
  direccion: string;
  rubros: string[];
  catalogo?: { name: string; size?: number; uri: string };
};

export type CampoConError =
  | 'razonSocial'
  | 'whatsapp'
  | 'telefono'
  | 'direccion'
  | 'rubros'
  | 'catalogo';

export type Errores = Partial<Record<CampoConError, string>>;

export const FORM_INICIAL: RegistroForm = {
  razonSocial: '',
  whatsapp: '',
  telefono: '',
  direccion: '',
  rubros: [],
};

/** Tamaño máximo del catálogo: 10 MB. */
export const CATALOGO_MAX_BYTES = 10 * 1024 * 1024;

const soloDigitos = (texto: string) => texto.replace(/\D/g, '');

/** Deja escribir solo lo que puede llevar un teléfono: números, espacios y un + al inicio. */
export function limpiarTelefono(texto: string) {
  const limpio = texto.replace(/[^\d\s+-]/g, '').replace(/(?!^)\+/g, '');
  // Con +54 adelante se deja como lo escribió; si no, se agrupa para leerlo fácil.
  if (limpio.startsWith('+')) return limpio.slice(0, 20);
  return agruparTelefono(limpio.replace(/\D/g, '')).slice(0, 20);
}

/** "2914550000" → "291 455-0000". Los separadores aparecen recién cuando hay un dígito después. */
function agruparTelefono(digitos: string) {
  // Largo del código de área: 11 (CABA), 0291 (fijo con 0) o 291.
  const area = digitos.startsWith('11') ? 2 : digitos.startsWith('0') ? 4 : 3;
  const medio = area === 2 ? 4 : 3;
  const a = digitos.slice(0, area);
  const b = digitos.slice(area, area + medio);
  const c = digitos.slice(area + medio);
  return [a, b && ` ${b}`, c && `-${c}`].join('');
}

/** Muestra un tamaño de archivo de forma legible: "850 KB", "2,4 MB". */
export function formatearTamano(bytes?: number) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
}

/** Nombre de cada pantalla del registro (una pregunta por pantalla). */
export type PasoId = 'nombre' | 'logo' | 'contacto' | 'direccion' | 'rubros' | 'catalogo';

/** Revisa los datos de una pantalla. Devuelve los errores encontrados; vacío = todo bien. */
export function validarPaso(paso: PasoId, form: RegistroForm): Errores {
  const errores: Errores = {};

  if (paso === 'nombre' && form.razonSocial.trim().length < 2) {
    errores.razonSocial = 'Escribí el nombre de tu negocio.';
  }

  if (paso === 'contacto') {
    const whatsapp = soloDigitos(form.whatsapp).length;
    if (whatsapp < 10 || whatsapp > 13) {
      errores.whatsapp = 'Ingresá un número válido, con código de área.';
    }
    const telefono = soloDigitos(form.telefono).length;
    if (telefono > 0 && telefono < 8) {
      errores.telefono = 'El teléfono parece incompleto.';
    }
  }

  if (paso === 'direccion' && form.direccion.trim().length < 5) {
    errores.direccion = 'Escribí la calle y el número.';
  }

  if (paso === 'rubros' && form.rubros.length === 0) {
    errores.rubros = 'Elegí al menos un rubro.';
  }

  if (paso === 'catalogo' && form.catalogo?.size && form.catalogo.size > CATALOGO_MAX_BYTES) {
    errores.catalogo = 'El archivo supera los 10 MB. Probá con uno más liviano.';
  }

  return errores;
}
