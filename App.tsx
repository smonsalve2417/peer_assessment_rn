import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";
import React from "react";
import { useColorScheme } from "react-native";
import { PaperProvider } from "react-native-paper";


import HomeScreen from "./src/features/home/HomeScreen";
import { darkTheme, lightTheme } from "./src/theme/theme";



export default function App() {
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
    <PaperProvider theme={theme}>
      <NavigationContainer theme={navigationTheme}>
        <HomeScreen />
      </NavigationContainer>
    </PaperProvider>
  );
}
