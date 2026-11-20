import { Avatar } from "@ui-kitten/components";
import { Redirect, useRouter } from "expo-router";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { Text} from "@ui-kitten/components";
import { Color } from "../../constants/theme";
import { useAuth } from "../../services/authContext";

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const nombreCompleto = user?.nombre;

  if (loading) {
    return null;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

        {/* BIENVENIDA */}
        <View style={styles.bienvenida}>
          <Avatar
            name={nombreCompleto}
            status="primary"
            shape="round"
            size="giant"
          />
          <Text category="h4" style={styles.textoBienvenida}>
            ¡Hola, {nombreCompleto}!
          </Text>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 25,
    paddingBottom: 20,
    justifyContent: "space-between",
  },

  bienvenida: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },

  textoBienvenida: {
    flex: 1,
    flexShrink: 1,
    marginLeft: 16,
  },
});
