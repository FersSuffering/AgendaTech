import { BottomNavigation, BottomNavigationTab } from "@ui-kitten/components";
import { Tabs } from "expo-router";
import {
  HomeIcon,
  PlannerIcon,
  CalendarIcon,
  SettingsIcon,
} from "../../constants/icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={({ state, navigateToTab }) => (
        <BottomNavigation
          style={{ paddingBottom: 25 }}
          selectedIndex={state.index}
          onSelect={(index) => {
            navigateToTab(state.routes[index].key);
          }}
        >
          <BottomNavigationTab
            title="Inicio"
            icon={(props) => (
              <HomeIcon {...props} selected={state.index === 0} />
            )}
          />

          <BottomNavigationTab
            title="Agenda"
            icon={(props) => (
              <PlannerIcon {...props} selected={state.index === 1} />
            )}
          />

          <BottomNavigationTab
            title="Horario"
            icon={(props) => (
              <CalendarIcon {...props} selected={state.index === 2} />
            )}
          />

          <BottomNavigationTab
            title="Ajustes"
            icon={(props) => (
              <SettingsIcon {...props} selected={state.index === 3} />
            )}
          />
        </BottomNavigation>
      )}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="agenda" />
      <Tabs.Screen name="horario" />
      <Tabs.Screen name="configuracion" />
    </Tabs>
  );
}
