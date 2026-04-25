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
  name?: string;
  email?: string;
  password?: string;
}

const backgroundImage = require("../../../../../assets/images/background.jpg");
const { width, height } = Dimensions.get("window");

export default function SignupScreen({ navigation }: { navigation: any }) {
  const { signup, error, clearError } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const showBackground = true;

  const handleSubmit = async () => {
    Keyboard.dismiss();
    const newErrors: FormErrors = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      newErrors.name = "Enter name";
    }

    if (!trimmedEmail) {
      newErrors.email = "Enter email";
    } else if (!trimmedEmail.includes("@")) {
      newErrors.email = "Enter valid email address";
    }

    if (!password) {
      newErrors.password = "Enter password";
    } else if (password.length < 8) {
      newErrors.password = "Password should have at least 8 characters";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);
      await signup(trimmedName, trimmedEmail, password);
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
          <View testID="signup-screen" style={styles.formContainer}>
            <Text variant="headlineMedium" style={styles.title}>
              Signup
            </Text>

            <Text variant="bodyMedium" style={styles.subtitle}>
              Create your account
            </Text>

            <View style={styles.spacer} />

            <TextBox
              hintText="Name"
              value={name}
              onChangeText={(text: string) => {
                setName(text);
                if (errors.name) {
                  setErrors((prev) => ({ ...prev, name: undefined }));
                }
              }}
              validatorFunc={(value) => {
                if (!value) {
                  return "Enter name";
                }
                return null;
              }}
              error={errors.name ?? null}
              setError={(fieldError) =>
                setErrors((prev) => ({
                  ...prev,
                  name: fieldError ?? undefined,
                }))
              }
            />

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
                if (value.length < 8) {
                  return "Password should have at least 8 characters";
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

            <ButtonHome text="Signup" onPressed={handleSubmit} />

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator animating color="white" />
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar
        testID="signup-error-snackbar"
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
    marginBottom: 8,
    color: "white",
    fontSize: 50,
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
