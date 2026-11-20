import { useRouter } from "expo-router";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { Text} from "@ui-kitten/components";
import { Color } from "../../constants/theme";

export default function Agenda() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

      <Text> Página de Agenda </Text>
        
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
    justifyContent: "space-between",
    alignItems: "center",
  },
});
