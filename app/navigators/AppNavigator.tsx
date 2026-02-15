import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { createDrawerNavigator } from "@react-navigation/drawer"
import Config from "../config"
import { ErrorBoundary } from "../screens/ErrorScreen/ErrorBoundary"
import { WelcomeScreen } from "../screens/WelcomeScreen"
import * as Screens from "../screens"
import { useAppTheme } from "../theme/context"
import { Toast } from "../components/Toast"
import type { AppStackParamList, DrawerParamList, NavigationProps } from "./navigationTypes"
import { navigationRef, useBackButtonHandler } from "./navigationUtilities"

const exitRoutes = Config.exitRoutes

const Stack = createNativeStackNavigator<AppStackParamList>()
const Drawer = createDrawerNavigator<DrawerParamList>()

const SettingsDrawer = () => {
  const {
    theme: { colors },
  } = useAppTheme()

  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: colors.background,
        },
        drawerActiveTintColor: colors.tint,
        drawerInactiveTintColor: colors.text,
      }}
    >
      <Drawer.Screen
        name="MqttSettings"
        component={Screens.MqttSettingsScreen}
        options={{ title: "MQTT Config" }}
      />
      <Drawer.Screen
        name="ThemeSettings"
        component={Screens.ThemeSettingsScreen}
        options={{ title: "Theme & Styles" }}
      />
      <Drawer.Screen
        name="DataSettings"
        component={Screens.DataSettingsScreen}
        options={{ title: "Backup & Data" }}
      />
      <Drawer.Screen
        name="LayoutSettings"
        component={Screens.LayoutSettingsScreen}
        options={{ title: "Widget Layout" }}
      />
    </Drawer.Navigator>
  )
}

const AppStack = () => {
  const {
    theme: { colors },
  } = useAppTheme()

  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        navigationBarColor: colors.background,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Dashboard" component={Screens.DashboardScreen} />
      <Stack.Screen name="Settings" component={SettingsDrawer} />
      <Stack.Screen name="CardEdit" component={Screens.CardEditScreen} />
    </Stack.Navigator>
  )
}

export const AppNavigator = (props: NavigationProps) => {
  const { navigationTheme } = useAppTheme()

  useBackButtonHandler((routeName) => exitRoutes.includes(routeName))

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme} {...props}>
      <ErrorBoundary catchErrors={Config.catchErrors}>
        <AppStack />
        <Toast />
      </ErrorBoundary>
    </NavigationContainer>
  )
}
