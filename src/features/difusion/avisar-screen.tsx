import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { AppText } from '@/components/ui/app-text';
import { Chip } from '@/components/ui/chip';
import { Titular } from '@/components/ui/editorial';
import { LineField } from '@/components/ui/line-field';
import { Marco } from '@/components/ui/marco';
import { fechaCorta } from '@/features/suscripcion/datos';
import { haptics } from '@/lib/haptics';
import { fonts, useAppTheme } from '@/theme';

import {
  clientes,
  NOMBRE_DESTINATARIOS,
  TEXTO_AVISO_MAX,
  TITULO_AVISO_MAX,
  validarAviso,
  type AvisoEnviado,
  type Cliente,
  type Destinatarios,
  type ErroresAviso,
} from './difusion';

type AvisarScreenProps = {
  /** Los ya enviados, del más nuevo al más viejo. */
  enviados: AvisoEnviado[];
  /** Cuántos clientes lo tienen de favorito y cuántos tiene en total. */
  alcance: { favoritos: number; todos: number };
  /** Busca clientes por nombre o localidad, sin los ya elegidos. */
  alBuscar: (texto: string, elegidos: string[]) => Cliente[];
  /** Envía el aviso. Devuelve a cuántos les llegó. */
  alEnviar: (aviso: {
    titulo: string;
    texto: string;
    a: Destinatarios;
    elegidos: Cliente[];
  }) => Promise<number>;
  alVolver: () => void;
};

const OPCIONES: { valor: Destinatarios; label: string }[] = [
  { valor: 'favoritos', label: 'Favoritos' },
  { valor: 'todos', label: 'Todos' },
  { valor: 'elegidos', label: 'Elegir' },
];

/** "Avisar a clientes": un título y un mensaje que les llegan como notificación al teléfono. */
export function AvisarScreen({
  enviados,
  alcance,
  alBuscar,
  alEnviar,
  alVolver,
}: AvisarScreenProps) {
  const { colors, spacing } = useAppTheme();
  const [a, setA] = useState<Destinatarios>('favoritos');
  const [elegidos, setElegidos] = useState<Cliente[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [titulo, setTitulo] = useState('');
  const [texto, setTexto] = useState('');
  const [errores, setErrores] = useState<ErroresAviso>({});
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState<string>();

  const resultados =
    a === 'elegidos'
      ? alBuscar(
          busqueda,
          elegidos.map((c) => c.id),
        )
      : [];

  const elegir = (cliente: Cliente) => {
    haptics.select();
    setElegidos((actuales) => [...actuales, cliente]);
    setBusqueda('');
    setErrores((e) => ({ ...e, clientes: undefined }));
  };

  const enviar = async () => {
    const encontrados = validarAviso(titulo, texto, a === 'elegidos' ? elegidos.length : undefined);
    setErrores(encontrados);
    if (Object.values(encontrados).some(Boolean)) {
      haptics.error();
      return;
    }
    setEnviando(true);
    const llegaron = await alEnviar({ titulo, texto, a, elegidos });
    setEnviando(false);
    setTitulo('');
    setTexto('');
    setElegidos([]);
    setListo(`Listo. Le llegó a ${clientes(llegaron)}.`);
    haptics.success();
  };

  const alcanceTexto =
    a === 'favoritos'
      ? `Le llega a ${clientes(alcance.favoritos)} que te tienen de favorito.`
      : a === 'todos'
        ? `Le llega a ${clientes(alcance.todos)}.`
        : elegidos.length > 0
          ? `Le llega a ${clientes(elegidos.length)}.`
          : undefined;

  return (
    <Marco
      alVolver={alVolver}
      accion={{ label: 'Enviar aviso', onPress: enviar, loading: enviando }}>
      <View style={{ gap: spacing.md }}>
        <Titular lineas={['Avisá a']} acento="tus clientes." clave="avisar" />
        <Animated.View entering={FadeIn.delay(220).duration(400)}>
          <AppText variant="subhead" color="textSecondary">
            Les llega como notificación al teléfono.
          </AppText>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInDown.delay(260).duration(400)} style={{ gap: spacing.xl }}>
        <View style={{ gap: spacing.sm }}>
          <View style={[styles.fila, { gap: spacing.sm }]}>
            {OPCIONES.map((opcion) => (
              <Chip
                key={opcion.valor}
                label={opcion.label}
                selected={a === opcion.valor}
                onToggle={() => {
                  setA(opcion.valor);
                  setErrores((e) => ({ ...e, clientes: undefined }));
                }}
              />
            ))}
          </View>
          {alcanceTexto ? (
            <AppText variant="footnote" color="textSecondary">
              {alcanceTexto}
            </AppText>
          ) : null}
        </View>

        {a === 'elegidos' ? (
          <Animated.View entering={FadeIn.duration(250)} style={{ gap: spacing.md }}>
            {elegidos.length > 0 ? (
              <View style={[styles.fila, { gap: spacing.sm }]}>
                {elegidos.map((cliente) => (
                  <Chip
                    key={cliente.id}
                    label={`${cliente.nombre}  ✕`}
                    selected
                    onToggle={() =>
                      setElegidos((actuales) => actuales.filter((c) => c.id !== cliente.id))
                    }
                  />
                ))}
              </View>
            ) : null}

            <LineField
              label="Buscar cliente"
              sinEtiqueta
              chico
              value={busqueda}
              onChangeText={setBusqueda}
              placeholder="Nombre del comercio o localidad"
              autoCorrect={false}
              autoFocus={elegidos.length === 0}
              error={errores.clientes}
              returnKeyType="search"
              onSubmitEditing={() => {
                if (resultados.length === 1) elegir(resultados[0]);
              }}
            />

            {resultados.length > 0 ? (
              <View style={[styles.bordeArriba, { borderColor: colors.border }]}>
                {resultados.map((cliente) => (
                  <Pressable
                    key={cliente.id}
                    onPress={() => elegir(cliente)}
                    accessibilityRole="button"
                    accessibilityLabel={`Agregar ${cliente.nombre}, ${cliente.localidad}`}
                    style={({ pressed }) => [
                      styles.resultado,
                      styles.bordeAbajo,
                      {
                        borderColor: colors.border,
                        gap: spacing.md,
                        paddingVertical: spacing.md,
                        backgroundColor: pressed ? colors.primarySoft : 'transparent',
                      },
                    ]}>
                    <View style={styles.flex}>
                      <AppText variant="body">{cliente.nombre}</AppText>
                      <AppText variant="footnote" color="textSecondary">
                        {cliente.localidad}
                      </AppText>
                    </View>
                    <AppText variant="callout" color="primaryText">
                      + Agregar
                    </AppText>
                  </Pressable>
                ))}
              </View>
            ) : busqueda.trim().length >= 2 ? (
              <AppText variant="footnote" color="textSecondary">
                No encontramos ese cliente.
              </AppText>
            ) : null}
          </Animated.View>
        ) : null}

        <LineField
          label="Título"
          sinEtiqueta
          chico
          value={titulo}
          onChangeText={(t) => {
            setTitulo(t);
            setListo(undefined);
          }}
          maxLength={TITULO_AVISO_MAX}
          placeholder="Llegó mercadería nueva"
          error={errores.titulo}
          returnKeyType="next"
        />

        <View style={{ gap: spacing.xs }}>
          <TextInput
            value={texto}
            onChangeText={(t) => {
              setTexto(t);
              setListo(undefined);
            }}
            multiline
            maxLength={TEXTO_AVISO_MAX}
            placeholder="Esta semana, 10% en bebidas…"
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.primary}
            accessibilityLabel="Mensaje"
            textAlignVertical="top"
            style={[
              styles.campo,
              {
                color: colors.text,
                borderColor: errores.texto ? colors.danger : colors.borderStrong,
              },
            ]}
          />
          <View style={styles.pie}>
            <AppText variant="footnote" color="danger">
              {errores.texto ?? ''}
            </AppText>
            <AppText variant="footnote" color="textSecondary" style={styles.contador}>
              {texto.length} / {TEXTO_AVISO_MAX}
            </AppText>
          </View>
        </View>

        {listo ? (
          <Animated.View entering={FadeIn.duration(300)}>
            <AppText variant="callout" color="primaryText">
              {listo}
            </AppText>
          </Animated.View>
        ) : null}
      </Animated.View>

      {enviados.length > 0 ? (
        <View style={{ gap: spacing.sm }}>
          <AppText variant="overline" color="textSecondary">
            ENVIADOS
          </AppText>
          <View style={[styles.bordeArriba, { borderColor: colors.border }]}>
            {enviados.map((aviso) => (
              <View
                key={aviso.id}
                style={[
                  styles.bordeAbajo,
                  { borderColor: colors.border, gap: spacing.xxs, paddingVertical: spacing.md },
                ]}>
                <AppText variant="headline">{aviso.titulo}</AppText>
                <AppText variant="subhead" color="textSecondary" numberOfLines={2}>
                  {aviso.texto}
                </AppText>
                <AppText variant="caption" color="textMuted">
                  {fechaCorta(new Date(aviso.fecha))} ·{' '}
                  {aviso.nombres?.join(', ') ?? NOMBRE_DESTINATARIOS[aviso.a]} ·{' '}
                  {clientes(aviso.alcance)}
                </AppText>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </Marco>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: 'row', flexWrap: 'wrap' },
  flex: { flex: 1 },
  resultado: { flexDirection: 'row', alignItems: 'center' },
  campo: {
    minHeight: 96,
    fontFamily: fonts.medium,
    fontSize: 17,
    lineHeight: 24,
    paddingVertical: 8,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    outlineStyle: 'none',
  } as object,
  pie: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  contador: { fontVariant: ['tabular-nums'] },
  bordeArriba: { borderTopWidth: StyleSheet.hairlineWidth },
  bordeAbajo: { borderBottomWidth: StyleSheet.hairlineWidth },
});
