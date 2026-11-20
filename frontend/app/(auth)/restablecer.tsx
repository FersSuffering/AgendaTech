import Tarjeta from "@/components/Tarjeta";
import { Layout, Text } from "@ui-kitten/components";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import CampoContrasena from "../../components/CampoContrasena";
import Divididor from "../../components/Divididor";
import { LockIcon } from "../../constants/icons";
import { Color } from "../../constants/theme";
import { restablecerPassword } from "../../services/authService";

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
  },
});

function Restablecer() {
  const router = useRouter();

  // Recibe los parámetros de recuperar
  const { correo, codigo } = useLocalSearchParams<{
    correo: string;
    codigo: string;
  }>();

  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");

  const [secureText, setSecureText] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);

  const [loading, setLoading] = useState(false);

  // RESTABLECER CONTRASEÑA
  const handleRestablecer = async () => {
    if (!correo || !codigo) {
      Alert.alert(
        "Solicitud inválida",
        "No se encontraron los datos de recuperación. Vuelve a solicitar un código.",
      );
      return;
    }

    if (!password.trim() || !confirmarPassword.trim()) {
      Alert.alert(
        "Campos incompletos",
        "Ingresa y confirma tu nueva contraseña.",
      );
      return;
    }

    if (password.length < 8) {
      Alert.alert(
        "Contraseña inválida",
        "La contraseña debe tener al menos 8 caracteres.",
      );
      return;
    }

    if (new TextEncoder().encode(password).length > 72) {
      Alert.alert(
        "Contraseña demasiado larga",
        "La contraseña no debe superar los 72 bytes.",
      );
      return;
    }

    if (password !== confirmarPassword) {
      Alert.alert(
        "Contraseñas diferentes",
        "Las contraseñas ingresadas no coinciden.",
      );
      return;
    }

    try {
      setLoading(true);

      const respuesta = await restablecerPassword(correo, codigo, password);

      Alert.alert(
        "¡Contraseña actualizada!",
        respuesta.mensaje || "Tu contraseña se ha restablecido correctamente.",
        [
          {
            text: "Iniciar sesión",
            onPress: () => router.replace("/login"),
          },
        ],
      );
    } catch (error: unknown) {
      const mensaje =
        error instanceof Error
          ? error.message
          : "No fue posible restablecer la contraseña.";

      Alert.alert("Error al restablecer", mensaje);
    } finally {
      setLoading(false);
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
          {/* TARJETA DE RESTABLECIMIENTO */}
          <Tarjeta>
            {/* ENCABEZADO */}
            <View style={{ marginBottom: 25 }}>
              <Text style={styles.tarjetaT}>Restablecer Contraseña</Text>

              <Text style={styles.tarjetaD}>
                Ingresa tu nueva contraseña para recuperar el acceso a tu
                cuenta.
              </Text>
            </View>

            {/* NUEVA CONTRASEÑA */}
            <CampoContrasena
              label="Nueva Contraseña"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChangeText={setPassword}
              accessoryLeft={LockIcon}
              secureTextEntry={secureText}
              onToggleVisibility={() => setSecureText((current) => !current)}
            />

            {/* CONFIRMAR CONTRASEÑA */}
            <CampoContrasena
              label="Confirmar Contraseña"
              placeholder="Repite tu contraseña"
              value={confirmarPassword}
              onChangeText={setConfirmarPassword}
              accessoryLeft={LockIcon}
              secureTextEntry={secureConfirm}
              onToggleVisibility={() => setSecureConfirm((current) => !current)}
            />

            {/* BOTÓN RESTABLECER */}
            <BotonPrimario onPress={handleRestablecer} disabled={loading}>
              {loading ? "Restableciendo..." : "Restablecer contraseña"}
            </BotonPrimario>

            <Divididor />
          </Tarjeta>
        </ScrollView>
      </KeyboardAvoidingView>
    </Layout>
  );
}

export default function App() {
  return <Restablecer />;
}
