import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";
import React, { useCallback } from "react";
import { useColorScheme, View } from "react-native";
import { PaperProvider } from "react-native-paper";
import * as SplashScreen from "expo-splash-screen";

import { darkTheme, lightTheme } from "./src/theme/theme";
import AuthFlow from "./src/AuthFlow";
import { DIProvider } from "./src/core/di/DIProvider";
import { AuthProvider } from "./src/features/auth/presentation/context/authContext";
import {
  useFonts,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

export default function App() {
  // const [fontsLoaded] = useFonts({
  //   Inter: Inter_400Regular,
  //   "Inter-Bold": Inter_700Bold,
  // });

  // const onLayoutRootView = useCallback(async () => {
  //   if (fontsLoaded) {
  //     // Ocultar la pantalla de carga cuando las fuentes estén listas
  //     await SplashScreen.hideAsync();
  //   }
  // }, [fontsLoaded]);

  // if (!fontsLoaded) {
  //   return null;
  // }

  const scheme = useColorScheme();
  const theme = scheme === "dark" ? darkTheme : lightTheme;

  if (__DEV__) console.log("Current theme:", scheme);

  const navigationTheme = {
    ...(scheme === "dark" ? DarkTheme : DefaultTheme),
    colors: {
      ...(scheme === "dark" ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.onSurface,
      border: theme.colors.outline,
      primary: theme.colors.primary,
      notification: theme.colors.error,
    },
  };

  return (
    //<View style={{ flex: 1 }} onLayout={onLayoutRootView}>
    <DIProvider>
      <AuthProvider>
        <PaperProvider theme={theme}>
          <NavigationContainer theme={navigationTheme}>
            <AuthFlow />
          </NavigationContainer>
        </PaperProvider>
      </AuthProvider>
    </DIProvider>
    //</View>
  );
}
