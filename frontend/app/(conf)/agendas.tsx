import {
  AgendasIcon,
  AgendaStatusIcon,
  BackIcon,
  DeleteIcon,
  EditIcon,
  PlusIcon,
} from "@/constants/icons";
import { Color } from "@/constants/theme";
import {
  crearAgenda,
  editarAgenda,
  eliminarAgenda,
  listarAgendas,
  seleccionarAgenda,
  type Agenda,
} from "@/services/agendasService";
import { Button, Card, Input, Modal, Text } from "@ui-kitten/components";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Agendas() {
  const router = useRouter();

  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [guardando, setGuardando] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [agendaEditando, setAgendaEditando] = useState<Agenda | null>(null);
  const [nombre, setNombre] = useState("");

  // CARGAR AGENDAS AUTOMÁTICAMENTE
  const cargarAgendas = useCallback(async () => {
    try {
      let resultado = await listarAgendas();

      if (resultado.length > 0) {
        const activas = resultado.filter((agenda) => Boolean(agenda.estatus));

        if (activas.length !== 1) {
          const agendaCorrecta = activas[0] ?? resultado[0];

          await seleccionarAgenda(agendaCorrecta.idAgenda);
          resultado = await listarAgendas();
        }
      }

      setAgendas(resultado);
    } catch (error: any) {
      console.error("Error obteniendo agendas:", error);

      Alert.alert(
        "Error",
        error.message || "No fue posible obtener las agendas.",
      );
    }
  }, []);

  // RECARGAR AL ENTRAR O REGRESAR
  useFocusEffect(
    useCallback(() => {
      cargarAgendas();
    }, [cargarAgendas]),
  );

  // ORDENAR AGENDAS: ACTIVA PRIMERO
  const agendasOrdenadas = [...agendas].sort(
    (a, b) => Number(Boolean(b.estatus)) - Number(Boolean(a.estatus)),
  );

  // MODAL
  const limpiarModal = () => {
    setModalVisible(false);
    setAgendaEditando(null);
    setNombre("");
  };

  const cerrarModal = () => {
    if (guardando) return;
    limpiarModal();
  };

  const abrirCrear = () => {
    setAgendaEditando(null);
    setNombre("");
    setModalVisible(true);
  };

  const abrirEditar = (agenda: Agenda) => {
    setAgendaEditando(agenda);
    setNombre(agenda.nombre);
    setModalVisible(true);
  };

  // CREAR O EDITAR AGENDA
  const guardarAgenda = async () => {
    const nombreLimpio = nombre.trim();

    if (!nombreLimpio) {
      Alert.alert("Aviso", "Ingresa el nombre de la agenda.");
      return;
    }

    if (nombreLimpio.length > 100) {
      Alert.alert("Aviso", "El nombre no puede superar los 100 caracteres.");
      return;
    }

    try {
      setGuardando(true);

      const estabaEditando = Boolean(agendaEditando);

      if (agendaEditando) {
        await editarAgenda(agendaEditando.idAgenda, nombreLimpio);
      } else {
        await crearAgenda(nombreLimpio);

        const agendasActualizadas = await listarAgendas();

        const existeActiva = agendasActualizadas.some((agenda) =>
          Boolean(agenda.estatus),
        );

        if (!existeActiva && agendasActualizadas.length > 0) {
          await seleccionarAgenda(agendasActualizadas[0].idAgenda);
        }
      }

      limpiarModal();

      await cargarAgendas();

      Alert.alert(
        "Correcto",
        estabaEditando
          ? "Agenda actualizada correctamente."
          : "Agenda creada correctamente.",
      );
    } catch (error: any) {
      console.error("Error guardando agenda:", error);

      Alert.alert(
        "Error",
        error.message || "No fue posible guardar la agenda.",
      );
    } finally {
      setGuardando(false);
    }
  };

  // SELECCIONAR AGENDA
  const handleSeleccionar = (agenda: Agenda) => {
    if (Boolean(agenda.estatus)) return;

    Alert.alert(
      "Seleccionar agenda",
      `¿Deseas seleccionar "${agenda.nombre}" como tu agenda activa?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Seleccionar",
          onPress: async () => {
            try {
              await seleccionarAgenda(agenda.idAgenda);
              await cargarAgendas();

              Alert.alert(
                "Correcto",
                `"${agenda.nombre}" ahora es tu agenda activa.`,
              );
            } catch (error: any) {
              console.error("Error seleccionando agenda:", error);

              Alert.alert(
                "Error",
                error.message || "No fue posible seleccionar la agenda.",
              );
            }
          },
        },
      ],
    );
  };

  // ELIMINAR AGENDA
  const handleEliminar = (agenda: Agenda) => {
    if (agendas.length <= 1) {
      Alert.alert(
        "No es posible eliminar",
        "Debes conservar al menos una agenda activa.",
      );
      return;
    }

    const activa = Boolean(agenda.estatus);

    const agendaReemplazo = agendas.find(
      (item) => item.idAgenda !== agenda.idAgenda,
    );

    if (!agendaReemplazo) return;

    Alert.alert(
      "Eliminar agenda",
      activa
        ? `¿Deseas eliminar "${agenda.nombre}"? "${agendaReemplazo.nombre}" será tu nueva agenda activa.`
        : `¿Estás seguro de eliminar "${agenda.nombre}"? Esta acción no se puede deshacer.`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              if (activa) {
                await seleccionarAgenda(agendaReemplazo.idAgenda);
              }

              await eliminarAgenda(agenda.idAgenda);
              await cargarAgendas();

              Alert.alert(
                "Correcto",
                activa
                  ? `Agenda eliminada. "${agendaReemplazo.nombre}" ahora es tu agenda activa.`
                  : "Agenda eliminada correctamente.",
              );
            } catch (error: any) {
              console.error("Error eliminando agenda:", error);

              Alert.alert(
                "Error",
                error.message || "No fue posible eliminar la agenda.",
              );
            }
          },
        },
      ],
    );
  };

  // TARJETA DE AGENDA
  const listarAgenda = (agenda: Agenda) => {
    const activa = Boolean(agenda.estatus);

    return (
      <Card
        key={agenda.idAgenda}
        style={[styles.agendaCard, activa && styles.agendaActiva]}
      >
        <View style={styles.agendaContenido}>
          <View style={styles.iconoAgenda}>
            <AgendasIcon
              selected={activa}
              fill={Color.primary}
              style={styles.iconoAgendaImagen}
            />
          </View>

          <View style={styles.agendaInfo}>
            <Text category="h6" style={styles.agendaNombre}>
              {agenda.nombre}
            </Text>
          </View>
        </View>

        {/* ACCIONES */}
        <View style={styles.acciones}>
          <Button
            size="small"
            appearance="outline"
            status="basic"
            accessoryLeft={(props) => (
              <AgendaStatusIcon
                {...props}
                selected={activa}
                fill={activa ? Color.primary : Color.secondary}
                style={styles.iconoAccion}
              />
            )}
            disabled={activa}
            onPress={() => handleSeleccionar(agenda)}
            style={[
              styles.botonSeleccionar,
              activa && styles.botonSeleccionada,
            ]}
          >
            <Text
              style={[
                styles.textoSeleccionar,
                activa && styles.textoSeleccionada,
              ]}
            >
              {activa ? "Seleccionada" : "Seleccionar"}
            </Text>
          </Button>

          <Button
            size="small"
            appearance="ghost"
            status="basic"
            accessoryLeft={(props) => (
              <EditIcon {...props} style={styles.iconoAccion} />
            )}
            onPress={() => abrirEditar(agenda)}
            style={styles.botonIcono}
          />

          <Button
            size="small"
            appearance="ghost"
            status="danger"
            accessoryLeft={(props) => (
              <DeleteIcon {...props} fill="red" style={styles.iconoAccion} />
            )}
            onPress={() => handleEliminar(agenda)}
            style={styles.botonIcono}
          />
        </View>
      </Card>
    );
  };

  // INTERFAZ
  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.botonRegresar}
          onPress={() => router.back()}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Regresar"
        >
          <BackIcon fill="#25252E" style={styles.iconoRegresar} />
        </TouchableOpacity>

        <Text category="h4" style={styles.titulo}>
          Mis Agendas
        </Text>

        <View style={styles.headerLateral} />
      </View>

      {/* LISTADO */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ marginBottom: 20 }}>
          <View style={{ gap: 18 }}>{agendasOrdenadas.map(listarAgenda)}</View>
        </View>
      </ScrollView>

      {/* BOTÓN INFERIOR */}
      <View style={styles.footer}>
        <Button
          accessoryLeft={PlusIcon}
          onPress={abrirCrear}
          style={styles.botonCrear}
          size="giant"
        >
          Crear Agenda
        </Button>
      </View>

      {/* MODAL CREAR / EDITAR */}

      <Modal
        visible={modalVisible}
        backdropStyle={styles.backdrop}
        onBackdropPress={cerrarModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "position"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 30 : 0}
          style={styles.modalKeyboard}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalScroll}
          >
            <Card disabled style={styles.modalCard}>
              <Text category="h5" style={styles.modalTitulo}>
                {agendaEditando ? "Editar Agenda" : "Nueva Agenda"}
              </Text>

              <Input
                label="Nombre de la Agenda"
                placeholder="Ej. Agenda Personal"
                value={nombre}
                onChangeText={setNombre}
                maxLength={100}
                autoFocus
                size="large"
                style={{ marginBottom: 24 }}
                textStyle={{ fontSize: 15 }}
              />

              <View style={styles.modalAcciones}>
                <Button
                  appearance="outline"
                  status="basic"
                  style={styles.modalBotonCancelar}
                  onPress={cerrarModal}
                  disabled={guardando}
                >
                  <Text style={styles.textoCancelar}>Cancelar</Text>
                </Button>

                <Button
                  style={styles.modalBotonPrincipal}
                  onPress={guardarAgenda}
                  disabled={guardando}
                >
                  {agendaEditando ? "Guardar" : "Crear"}
                </Button>
              </View>
            </Card>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: "#FFFFFF",
  },

  botonRegresar: {
    width: 42,
    height: 42,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  iconoRegresar: {
    width: 27,
    height: 27,
  },

  headerLateral: {
    width: 42,
    height: 42,
  },

  titulo: {
    flex: 1,
    fontSize: 29,
    fontWeight: "bold",
    color: "#25252E",
    textAlign: "center",
  },

  // CONTENIDO
  content: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 30,
    flexGrow: 1,
  },

  // TARJETAS
  agendaCard: {
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#F3F2F6",
    backgroundColor: "#FFFFFF",
    padding: 13,
    elevation: 1,
    shadowColor: "#77718A",
    shadowOpacity: 0.045,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  agendaActiva: {
    borderColor: Color.primary,
    borderWidth: 1.5,
    backgroundColor: "#FFFFFF",
  },

  agendaContenido: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingBottom: 7,
    paddingHorizontal: 5,
  },

  iconoAgenda: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: "#F0EAFF",
    alignItems: "center",
    justifyContent: "center",
  },

  iconoAgendaImagen: {
    width: 27,
    height: 27,
  },

  agendaInfo: {
    flex: 1,
    gap: 6,
  },

  agendaNombre: {
    color: "#292832",
    fontWeight: "bold",
    fontSize: 18,
    flexShrink: 1,
  },

  // ACCIONES
  acciones: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    paddingHorizontal: 5,
    paddingTop: 10,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#F5F4F7",
  },

  botonSeleccionar: {
    marginRight: "auto",
    borderRadius: 13,
    borderColor: Color.secondary,
  },

  botonSeleccionada: {
    borderColor: Color.primary,
  },

  textoSeleccionar: {
    color: Color.secondary,
    fontSize: 12,
  },

  textoSeleccionada: {
    color: Color.primary,
    fontSize: 12,
  },

  botonIcono: {
    borderRadius: 12,
  },

  iconoAccion: {
    width: 20,
    height: 20,
  },

  // FOOTER
  footer: {
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F5F4F7",
  },

  botonCrear: {
    height: 76,
    borderRadius: 25,
    backgroundColor: "#6038E8",
    borderColor: "#6038E8",
    elevation: 4,
    shadowColor: "#6038E8",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
  },

  // MODAL
  backdrop: {
    backgroundColor: "rgba(30, 25, 50, 0.42)",
  },

  modalKeyboard: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  modalScroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },

  modalCard: {
    width: 330,
    maxWidth: "100%",
    borderRadius: 26,
    padding: 12,
    backgroundColor: "#FFFFFF",
  },

  modalTitulo: {
    textAlign: "center",
    color: "#292832",
    fontWeight: "bold",
    paddingBottom: 15,
  },

  modalAcciones: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  modalBotonCancelar: {
    flex: 1,
    borderRadius: 13,
    borderColor: Color.secondary,
  },

  textoCancelar: {
    color: Color.secondary,
    fontWeight: "bold",
  },

  modalBotonPrincipal: {
    flex: 1,
    borderRadius: 13,
    backgroundColor: "#6038E8",
    borderColor: "#6038E8",
  },
});
