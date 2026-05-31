import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import { useAuth } from "./features/auth/presentation/context/authContext";
import LoginScreen from "./features/auth/presentation/screens/LoginScreen";
import SignupScreen from "./features/auth/presentation/screens/SignupScreen";
import HomeScreen from "./features/auth/presentation/screens/HomeScreen";
import HomeStudentPage from "./features/home-student/presentation/screens/home_student_page";
import HomeProfessorPage from "./features/home-profesor/presentation/screens/home_professor_page";
import TapCourseScreen from "./features/tap-on-course/presentation/screens/tap_course_screen";
import EvalFormScreen from "./features/eval-form/presentation/screens/eval_form_screen";
import AnalyticsStudentScreen from "./features/analytics-student/presentation/screens/AnalyticsStudentScreen";
import CreateEvaluationScreen from "./features/create-eval/presentation/screens/create_eval_screen";
import AnalyticsTeacherScreen from "./features/analytics-teacher/presentation/screens/AnalyticsTeacherScreen";

const Stack = createStackNavigator();

export default function AuthFlow() {
  const { isLoggedIn, isStudent } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ 
    headerShown: false,
    animation: 'none',}}>
      {isLoggedIn ? (
        <>
          {/* La primera Screen es la que se muestra al entrar */}
          {isStudent ? (
            <Stack.Screen name="HomeStudentPage" component={HomeStudentPage} />
          ) : (
            <Stack.Screen name="HomeProfessorPage" component={HomeProfessorPage} />
          )}
          <Stack.Screen name="TapCourseScreen" component={TapCourseScreen} />
          <Stack.Screen name="EvalFormScreen" component={EvalFormScreen} />
          <Stack.Screen
            name="AnalyticsStudentScreen"
            component={AnalyticsStudentScreen}
          />
          <Stack.Screen name="CreateEvaluationScreen" component={CreateEvaluationScreen} />
          <Stack.Screen name="AnalyticsTeacherScreen" component={AnalyticsTeacherScreen} />
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