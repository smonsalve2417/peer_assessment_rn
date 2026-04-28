import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur"; // Necesitas instalar: npx expo install expo-blur
import { ButtonHome } from "../components/ButtonHome"; // Ajusta la ruta

const backgroundImage = require("../../../../../assets/images/background.jpg");
const { width, height } = Dimensions.get("window");

export default function HomeScreen({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={backgroundImage}
        resizeMode="cover"
        style={styles.fullScreen}
      >
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill}>
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "rgba(0,0,0,0.2)" },
            ]}
          />
        </BlurView>

        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Evaluo</Text>
          </View>

          <View style={styles.footerContainer}>
            <ButtonHome
              text="Log in"
              onPressed={() => navigation.navigate("LoginScreen")}
            />
            <View style={{ height: 40 }} />
            <ButtonHome
              text="Sign in"
              onPressed={() => navigation.navigate("SignupScreen")}
            />
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fullScreen: {
    width: width,
    height: height,
  },
  safeArea: {
    flex: 1,
    // mainAxisAlignment: MainAxisAlignment.spaceBetween
    justifyContent: "space-between",
  },
  headerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 80,
    fontWeight: "bold",
    color: "white",
    // Asegúrate de tener cargada la fuente MadimiOne o usa la del sistema
    //fontFamily: "MadimiOne",
    textAlign: "center",
  },
  footerContainer: {
    // padding horizontal: 24, vertical: 32
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
});
