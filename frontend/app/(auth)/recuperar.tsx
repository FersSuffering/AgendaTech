import Tarjeta from "@/components/Tarjeta";
import {
  Button,
  Card,
  Input,
  Layout,
  Modal,
  Text,
} from "@ui-kitten/components";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import BotonPrimario from "../../components/BotonPrimario";
import Campo from "../../components/Campo";
import Divididor from "../../components/Divididor";
import { MailIcon } from "../../constants/icons";
import { Color } from "../../constants/theme";
import {
  recuperarPassword,
  verificarCodigoRecuperacion,
} from "../../services/authService";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 35,
  },

  tarjetaT: {
    fontSize: 25,
    fontWeight: "800",
    color: Color.text,
    marginBottom: 10,
    letterSpacing: -0.6,
    textAlign: "center",
  },

  tarjetaD: {
    fontSize: 14,
    color: Color.secondaryText,
    lineHeight: 22,
    textAlign: "center",
  },

  loginC: {
    alignItems: "center",
    gap: 7,
  },

  loginT: {
    fontSize: 13,
    color: Color.secondaryText,
  },

  login: {
    fontSize: 14,
    fontWeight: "800",
    color: Color.primary,
  },

  // MODAL
  backdrop: {
    backgroundColor: "rgba(30, 25, 50, 0.42)",
  },

  modalKeyboard: {
    width: "100%",
    flex: 1,
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
    paddingBottom: 12,
  },

  modalDescripcion: {
    fontSize: 14,
    color: Color.secondaryText,
    lineHeight: 21,
    textAlign: "left",
    marginBottom: 20,
  },

  codigoInput: {
    textAlign: "center",
    fontSize: 23,
    fontWeight: "bold",
    letterSpacing: 8,
  },

  modalAcciones: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 16,
  },

  modalBotonCancelar: {
    flex: 1,
    borderRadius: 11,
    borderColor: Color.secondary,
    minHeight: 38,
  },

  modalBotonPrincipal: {
    flex: 1,
    borderRadius: 11,
    backgroundColor: "#6038E8",
    borderColor: "#6038E8",
    minHeight: 38,
  },

  textoCancelar: {
    color: Color.secondary,
    fontWeight: "bold",
    fontSize: 12,
  },
});

function Recuperar() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");

  const [loading, setLoading] = useState(false);
  const [verificando, setVerificando] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);

  // ENVIAR CÓDIGO
  const handleRecuperar = async () => {
    if (!email.trim()) {
      Alert.alert(
        "Campo incompleto",
        "Ingresa tu correo electrónico para continuar.",
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      Alert.alert(
        "Correo inválido",
        "Verifica que tu correo electrónico sea correcto.",
      );
      return;
    }

    try {
      setLoading(true);

      const correoNormalizado = email.trim().toLowerCase();

      const respuesta = await recuperarPassword(correoNormalizado);

      setEmail(correoNormalizado);
      setCodigo("");
      setModalVisible(true);
    } catch (error: unknown) {
      const mensaje =
        error instanceof Error ? error.message : "Ocurrió un error inesperado.";

      Alert.alert("Error al recuperar contraseña", mensaje);
    } finally {
      setLoading(false);
    }
  };

  // CERRAR MODAL
  const cerrarModal = () => {
    if (verificando) return;

    setModalVisible(false);
    setCodigo("");
  };

  // VERIFICAR CÓDIGO
  const handleVerificarCodigo = async () => {
    if (!codigo.trim()) {
      Alert.alert(
        "Campo incompleto",
        "Ingresa el código que recibiste en tu correo.",
      );
      return;
    }

    if (!/^\d{6}$/.test(codigo.trim())) {
      Alert.alert(
        "Código inválido",
        "El código debe contener exactamente 6 dígitos.",
      );
      return;
    }

    try {
      setVerificando(true);

      await verificarCodigoRecuperacion(email, codigo.trim());

      setModalVisible(false);

      router.push({
        pathname: "/restablecer",
        params: {
          correo: email,
          codigo: codigo.trim(),
        },
      });
    } catch (error: unknown) {
      const mensaje =
        error instanceof Error
          ? error.message
          : "No fue posible verificar el código.";

      Alert.alert("Error de verificación", mensaje);
    } finally {
      setVerificando(false);
    }
  };

  return (
    <Layout style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* TARJETA DE RECUPERACIÓN */}
          <Tarjeta>
            {/* ENCABEZADO */}
            <View style={{ marginBottom: 30 }}>
              <Text style={styles.tarjetaT}>Recuperar Contraseña</Text>

              <Text style={styles.tarjetaD}>
                Se enviará un código a tu correo electrónico para que puedas
                restablecer tu contraseña.
              </Text>
            </View>

            {/* CORREO ELECTRÓNICO */}
            <Campo
              label="Correo Electrónico"
              placeholder="ejemplo@correo.com"
              value={email}
              onChangeText={setEmail}
              accessoryLeft={MailIcon}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* BOTÓN RECUPERAR */}
            <BotonPrimario onPress={handleRecuperar} disabled={loading}>
              {loading ? "Enviando..." : "Enviar"}
            </BotonPrimario>

            <Divididor />

            {/* REGRESAR AL LOGIN */}
            <View style={styles.loginC}>
              <Text style={styles.loginT}>¿Recordaste tu contraseña?</Text>

              <Text style={styles.login} onPress={() => router.push("/login")}>
                Iniciar sesión
              </Text>
            </View>
          </Tarjeta>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* MODAL DE VERIFICACIÓN */}
      <Modal
        visible={modalVisible}
        backdropStyle={styles.backdrop}
        onBackdropPress={cerrarModal}
      >
        <KeyboardAvoidingView
          behavior="padding"
          keyboardVerticalOffset={0}
          style={styles.modalKeyboard}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalScroll}
          >
            <Card disabled style={styles.modalCard}>
              <Text category="h5" style={styles.modalTitulo}>
                Verificar Correo
              </Text>

              <Text style={styles.modalDescripcion}>
                Introduce el código que recibiste para continuar.
              </Text>

              <Input
                label="Código de Verificación"
                placeholder="000000"
                value={codigo}
                onChangeText={(valor) =>
                  setCodigo(valor.replace(/\D/g, "").slice(0, 6))
                }
                keyboardType="number-pad"
                maxLength={6}
                size="large"
                autoFocus
                textStyle={styles.codigoInput}
              />

              <Text
                style={{
                  textAlign: "center",
                  color: Color.secondaryText,
                  fontSize: 12,
                  marginTop: 12,
                }}
              >
                El código tiene una validez de 10 minutos.
              </Text>

              <View style={styles.modalAcciones}>
                <Button
                  size="small"
                  appearance="outline"
                  status="basic"
                  style={styles.modalBotonCancelar}
                  onPress={cerrarModal}
                  disabled={verificando}
                >
                  <Text style={styles.textoCancelar}>Cancelar</Text>
                </Button>

                <Button
                  size="small"
                  style={styles.modalBotonPrincipal}
                  onPress={handleVerificarCodigo}
                  disabled={verificando || codigo.length !== 6}
                >
                  {verificando ? "Verificando..." : "Continuar"}
                </Button>
              </View>
            </Card>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </Layout>
  );
}

export default function App() {
  return <Recuperar />;
}
