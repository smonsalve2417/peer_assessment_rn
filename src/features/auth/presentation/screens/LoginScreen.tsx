import { BlurView } from "expo-blur";
import React, { useState } from "react";
import {
  Dimensions,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { ActivityIndicator, Snackbar, Text } from "react-native-paper";
import { useAuth } from "../context/authContext";
import TextBox from "../components/TextBox";
import { ButtonHome } from "../components/ButtonHome";

interface FormErrors {
  email?: string;
  password?: string;
}
const backgroundImage = require("../../../../../assets/images/background.jpg");
const { width, height } = Dimensions.get("window");

export default function LoginScreen({ navigation }: { navigation: any }) {
  const { login, error, clearError } = useAuth();

  const [email, setEmail] = useState("augustosalazar@uninorte.edu.co");
  const [password, setPassword] = useState("ThePassword!1");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const showBackground = true;

  const handleSubmit = async () => {
    Keyboard.dismiss();
    const newErrors: FormErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      newErrors.email = "Enter email";
    } else if (!trimmedEmail.includes("@")) {
      newErrors.email = "Enter valid email address";
    }

    if (!password) {
      newErrors.password = "Enter password";
    } else if (password.length < 6) {
      newErrors.password = "Password should have at least 6 characters";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);
      await login(trimmedEmail, password);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {showBackground ? (
        <ImageBackground
          source={backgroundImage}
          resizeMode="cover"
          style={styles.fullScreen}
        />
      ) : null}

      <BlurView intensity={40} tint="dark" style={styles.fullScreen} />
      <View style={styles.overlay} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.fullScreen}
      >
        <View style={styles.appBar}>
          {navigation?.canGoBack?.() ? (
            <Pressable onPress={navigation.goBack} style={styles.backButton}>
              <Text style={styles.backText}>{"<"}</Text>
            </Pressable>
          ) : null}
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.formContainer}>
            <Text variant="headlineMedium" style={styles.title}>
              Let's get you signed in
            </Text>

            <Text variant="bodyMedium" style={styles.subtitle}>
              Sign in to your account
            </Text>

            <View style={styles.spacer} />

            <TextBox
              hintText="Email"
              value={email}
              onChangeText={(text: string) => {
                setEmail(text);
                if (errors.email) {
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              validatorFunc={(value) => {
                if (!value) {
                  return "Enter email";
                }
                if (!value.includes("@")) {
                  return "Enter valid email address";
                }
                return null;
              }}
              error={errors.email ?? null}
              setError={(fieldError) =>
                setErrors((prev) => ({
                  ...prev,
                  email: fieldError ?? undefined,
                }))
              }
            />

            <TextBox
              hintText="Password"
              value={password}
              onChangeText={(text: string) => {
                setPassword(text);
                if (errors.password) {
                  setErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              obscureText
              validatorFunc={(value) => {
                if (!value) {
                  return "Enter password";
                }
                if (value.length < 6) {
                  return "Password should have at least 6 characters";
                }
                return null;
              }}
              error={errors.password ?? null}
              setError={(fieldError) =>
                setErrors((prev) => ({
                  ...prev,
                  password: fieldError ?? undefined,
                }))
              }
            />

            <View style={styles.spacer} />

            <ButtonHome text="Log in" onPressed={handleSubmit} />

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator animating color="white" />
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar
        visible={!!error}
        onDismiss={clearError}
        duration={3000}
        action={{ label: "Dismiss", onPress: clearError }}
      >
        {error}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  fullScreen: {
    width: width,
    height: height,
    position: "absolute",
    top: 0,
    left: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  appBar: {
    height: 72,
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    color: "white",
    fontSize: 28,
    lineHeight: 30,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  formContainer: {
    width: "100%",
    maxWidth: 450,
    alignSelf: "center",
  },
  title: {
    color: "white",
    fontSize: 30,
    fontWeight: "700",
    textAlign: "left",
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.75)",
    fontSize: 15,
    marginTop: 6,
    textAlign: "left",
  },
  spacer: {
    height: 20,
  },
  loadingContainer: {
    marginTop: 14,
    alignItems: "center",
  },
});
