import { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Layout, Text } from "@ui-kitten/components";
import { Color } from "../../constants/theme";
import { LogoIcon, MailIcon, LockIcon } from "../../constants/icons";
import Tarjeta from "@/components/Tarjeta";
import Campo from "../../components/Campo";
import CampoContrasena from "../../components/CampoContrasena";
import BotonPrimario from "../../components/BotonPrimario";
import Divididor from "../../components/Divididor";
import { useRouter } from "expo-router";
import { useAuth } from "../../services/authContext";

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

  header: {
    alignItems: "center",
    marginBottom: 32,
  },

  logo: {
    width: 76,
    height: 76,
    borderRadius: 25,
    backgroundColor: Color.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: Color.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 6,
  },

  logoIcon: {
    width: 50,
    height: 45,
  },

  titulo: {
    fontSize: 28,
    fontWeight: "800",
    color: Color.text,
    letterSpacing: -0.8,
  },

  subtitulo: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    color: Color.secondaryText,
    marginTop: 7,
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

  recuperar: {
    fontSize: 12,
    color: Color.primary,
    fontWeight: "700",
    marginBottom: 10,
  },

  recuperarC: {
    marginTop: -5,
    marginBottom: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  recuperarT: {
    fontSize: 12,
    color: Color.secondaryText,
  },

  registrarC: {
    alignItems: "center",
    gap: 7,
  },

  registrarT: {
    fontSize: 13,
    color: Color.secondaryText,
  },

  registrar: {
    fontSize: 14,
    fontWeight: "800",
    color: Color.primary,
  },
});

function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
  if (!email.trim() || !password.trim()) {
    Alert.alert(
      "Campos incompletos",
      "Ingresa tu correo electrónico y contraseña."
    );
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email.trim())) {
    Alert.alert(
      "Correo inválido",
      "Verifica que tu correo electrónico sea correcto."
    );
    return;
  }

  try {
    setLoading(true);

    // Iniciar sesión y actualizar el contexto
    await login(email.trim().toLowerCase(), password);

    Alert.alert("¡Bienvenido!", "Se ha iniciado sesión correctamente.", [
      {
        text: "Continuar",
        onPress: () => router.replace("/(tabs)"),
      },
    ]);

  } catch (error: unknown) {
    const mensaje =
      error instanceof Error
        ? error.message
        : "Ocurrió un error inesperado.";

    Alert.alert("Error", mensaje);

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
          {/* Encabezado */}
          <View style={styles.header}>
            <View style={styles.logo}>
              <LogoIcon fill={Color.white} style={styles.logoIcon} />
            </View>

            <Text style={styles.titulo}>AgendaTech</Text>

            <Text style={styles.subtitulo}>APRENDE. ORGANIZA. PLANEA.</Text>
          </View>

          {/* Tarjeta de login */}
          <Tarjeta>
            <View style={{ marginBottom: 30 }}>
              <Text style={styles.tarjetaT}>Inicia Sesión</Text>

              <Text style={styles.tarjetaD}>
                Tu vida escolar en la palma de tu mano.
              </Text>
            </View>

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
              placeholder="Ingresa tu contraseña"
              value={password}
              onChangeText={setPassword}
              accessoryLeft={LockIcon}
              secureTextEntry={secureText}
              onToggleVisibility={() => setSecureText((current) => !current)}
            />

            {/* Recuperar */}
            <View style={styles.recuperarC}>
              <Text style={styles.recuperarT}>¿Olvidaste tu contraseña?</Text>
              <Text
                style={styles.recuperar}
                onPress={() => router.push("/recuperar")}
              >
                Recupérala
              </Text>
            </View>

            {/* Botón de Iniciar Sesión */}
            <BotonPrimario onPress={handleLogin} disabled={loading}>
              {loading ? "Iniciando Sesión..." : "Iniciar Sesión"}
            </BotonPrimario>

            <Divididor />

            {/* Registro */}
            <View style={styles.registrarC}>
              <Text style={styles.registrarT}>¿Aún no tienes una cuenta?</Text>

              <Text
                style={styles.registrar}
                onPress={() => router.push("/registrar")}
              >
                Crear cuenta
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
      <Login />
    </>
  );
}
