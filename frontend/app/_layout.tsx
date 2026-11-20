import { Stack } from "expo-router";
import { AuthProvider } from "../services/authContext";
import { ApplicationProvider, IconRegistry } from "@ui-kitten/components";
import { EvaIconsPack } from "@ui-kitten/eva-icons";
import { LightTheme } from "@/constants/theme";
import customMapping from "../custom-mapping";


export default function RootLayout() {

  return (
    <>
      <IconRegistry icons={EvaIconsPack} />

      <ApplicationProvider mapping={customMapping} theme={LightTheme}>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </AuthProvider>
      </ApplicationProvider>
    </>
  );
}
