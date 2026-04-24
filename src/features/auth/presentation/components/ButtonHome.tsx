import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

// Nota: Para usar fuentes personalizadas como "Inter" en React Native,
// usualmente necesitas instalar 'expo-font' o configurar los assets nativos.
// Si no la tienes instalada, usará la fuente por defecto del sistema.

interface ButtonHomeProps {
  onPressed: () => void;
  text: string;
}

export const ButtonHome = ({ onPressed, text }: ButtonHomeProps) => {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPressed}
      activeOpacity={0.7}
    >
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    // Colors.black.withValues(alpha: 0.6) -> rgba(0, 0, 0, 0.6)
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    // EdgeInsets.symmetric(vertical: 30)
    paddingVertical: 20,
    borderRadius: 100, // Añadido un pequeño radio para que parezca un botón moderno
    alignItems: "center",
    justifyContent: "center",
    width: "100%", // Para que se comporte como un bloque
  },
  text: {
    color: "white",
    fontSize: 25,
    // GoogleFonts.inter -> Requiere configuración previa de la fuente en el proyecto
    fontFamily: "Inter",
    textAlign: "center",
  },
});
