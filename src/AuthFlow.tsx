import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import { useAuth } from "./features/auth/presentation/context/authContext";
import LoginScreen from "./features/auth/presentation/screens/LoginScreen";
import SignupScreen from "./features/auth/presentation/screens/SignupScreen";
import HomeScreen from "./features/auth/presentation/screens/HomeScreen";
import HomeStudentPage from "./features/home-student/presentation/screens/home_student_page";
import TapCourseScreen from "./features/tap-on-course/presentation/screens/tap_course_screen";
import EvalFormScreen from "./features/eval-form/presentation/screens/eval_form_screen";
import AnalyticsStudentScreen from "./features/analytics-student/presentation/screens/AnalyticsStudentScreen";

const Stack = createStackNavigator();

export default function AuthFlow() {
  const { isLoggedIn } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <>
          <Stack.Screen name="HomeStudentPage" component={HomeStudentPage} />
          <Stack.Screen name="TapCourseScreen" component={TapCourseScreen} />
          <Stack.Screen name="EvalFormScreen" component={EvalFormScreen} />
          <Stack.Screen
            name="AnalyticsStudentScreen"
            component={AnalyticsStudentScreen}
          />
        </>
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
