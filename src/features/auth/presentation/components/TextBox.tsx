import React from "react";
import { View, TextInput, Text, StyleSheet } from "react-native";

type TextBoxProps = {
  hintText: string;
  value: string;
  onChangeText: (text: string) => void;
  obscureText?: boolean;
  validatorFunc?: (text: string) => string | null;
  error?: string | null;
  setError?: (error: string | null) => void;
};

const TextBox: React.FC<TextBoxProps> = ({
  hintText,
  value,
  onChangeText,
  obscureText = false,
  validatorFunc,
  error,
  setError,
}) => {
  const handleValidation = (text: string) => {
    if (validatorFunc && setError) {
      const result = validatorFunc(text);
      setError(result);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={(text) => {
          onChangeText(text);
          handleValidation(text);
        }}
        placeholder={hintText}
        placeholderTextColor="#aaa"
        secureTextEntry={obscureText}
        style={styles.input}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 5,
    padding: 12,
    color: "white",
  },
  error: {
    color: "red",
    marginTop: 5,
  },
});

export default TextBox;
