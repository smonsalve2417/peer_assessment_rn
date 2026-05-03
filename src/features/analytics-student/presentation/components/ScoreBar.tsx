import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = {
  label: string;
  value: number;
  maxValue?: number;
};

export const ScoreBar: React.FC<Props> = ({ label, value, maxValue = 5 }) => {
  const ratio = Math.max(0, Math.min(1, value / maxValue));
  return (
    <View style={styles.row}>
      <View style={{ width: 110 }}>
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.barContainer}>
        <View style={styles.barBackground}>
          <View style={[styles.barFill, { width: `${ratio * 100}%` }]} />
        </View>
      </View>
      <View style={{ width: 10 }} />
      <View style={{ width: 32 }}>
        <Text style={styles.value}>{value.toFixed(1)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  barContainer: {
    flex: 1,
  },
  barBackground: {
    height: 10,
    backgroundColor: "#3A2016",
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: "#BB3322",
  },
  value: {
    color: "#FF8C60",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "right",
  },
});

export default ScoreBar;
