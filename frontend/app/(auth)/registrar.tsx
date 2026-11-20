import Tarjeta from "@/components/Tarjeta";
import { Layout, Text } from "@ui-kitten/components";
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
import CampoContrasena from "../../components/CampoContrasena";
import Divididor from "../../components/Divididor";
import { LockIcon, MailIcon, PersonIcon } from "../../constants/icons";
import { Color } from "../../constants/theme";
import { registrarUsuario } from "../../services/authService";

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
});

function Registrar() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");

  const [secureText, setSecureText] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);

  const [loading, setLoading] = useState(false);

  const handleRegistro = async () => {
    if (
      !nombre.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmarPassword.trim()
    ) {
      Alert.alert(
        "Campos incompletos",
        "Completa todos los campos para continuar.",
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

    if (password.length < 8) {
      Alert.alert(
        "Contraseña débil",
        "La contraseña debe tener al menos 8 caracteres.",
      );
      return;
    }

    if (password !== confirmarPassword) {
      Alert.alert("Contraseñas diferentes", "Las contraseñas no coinciden.");
      return;
    }

    try {
      setLoading(true);

      const respuesta = await registrarUsuario(
        nombre.trim(),
        email.trim().toLowerCase(),
        password,
      );

      Alert.alert(
        "¡Registro exitoso!",
        `Tu cuenta ha sido creada, ${respuesta.usuario.nombre}.`,
        [
          {
            text: "Continuar",
            onPress: () => router.push("/"),
          },
        ],
      );
    } catch (error: unknown) {
      const mensaje =
        error instanceof Error ? error.message : "Ocurrió un error inesperado.";

      Alert.alert("Error al registrar", mensaje);
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
          {/* Tarjeta de registro */}
          <Tarjeta>
            <View style={{ marginBottom: 25 }}>
              <Text style={styles.tarjetaT}>Crear Cuenta</Text>

              <Text style={styles.tarjetaD}>
                Regístrate y comienza a organizar tu vida escolar.
              </Text>
            </View>

            {/* Nombre */}
            <Campo
              label="Nombre Completo"
              placeholder="Ingresa tu nombre"
              value={nombre}
              onChangeText={setNombre}
              accessoryLeft={PersonIcon}
              autoCapitalize="words"
              autoCorrect={false}
            />

            {/* Correo */}
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

            {/* Contraseña */}
            <CampoContrasena
              label="Contraseña"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChangeText={setPassword}
              accessoryLeft={LockIcon}
              secureTextEntry={secureText}
              onToggleVisibility={() => setSecureText((current) => !current)}
            />

            {/* Confirmar contraseña */}
            <CampoContrasena
              label="Confirmar Contraseña"
              placeholder="Repite tu contraseña"
              value={confirmarPassword}
              onChangeText={setConfirmarPassword}
              accessoryLeft={LockIcon}
              secureTextEntry={secureConfirm}
              onToggleVisibility={() => setSecureConfirm((current) => !current)}
            />

            {/* Botón Registrar */}
            <BotonPrimario onPress={handleRegistro} disabled={loading}>
              {loading ? "Creando Cuenta..." : "Crear Cuenta"}
            </BotonPrimario>

            <Divididor />

            {/* Ir a login */}
            <View style={styles.loginC}>
              <Text style={styles.loginT}>¿Ya tienes una cuenta?</Text>

              <Text style={styles.login} onPress={() => router.push("/login")}>
                Iniciar sesión
              </Text>
            </View>
          </Tarjeta>
        </ScrollView>
      </KeyboardAvoidingView>
    </Layout>
  );
}

export default function App() {
  return (
    <>
      <Registrar />
    </>
  );
}
