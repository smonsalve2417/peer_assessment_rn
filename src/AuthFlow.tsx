import { FontAwesome6 } from "@react-native-vector-icons/fontawesome6";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import { useAuth } from "./features/auth/presentation/context/authContext";
import LoginScreen from "./features/auth/presentation/screens/LoginScreen";
import SignupScreen from "./features/auth/presentation/screens/SignupScreen";
import HomeScreen from "./features/auth/presentation/screens/HomeScreen";

const Stack = createStackNavigator();

export default function AuthFlow() {
  const { isLoggedIn } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <Stack.Screen name="Authenticated" component={HomeScreen} />
      ) : (
        <>
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="SignupScreen" component={SignupScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
