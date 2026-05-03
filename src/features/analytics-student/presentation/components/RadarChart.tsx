import React from "react";
import { View, StyleSheet, Text } from "react-native";
import Svg, { Polygon, Line } from "react-native-svg";

type Props = {
  punctuality: number;
  contributions: number;
  commitment: number;
  attitude: number;
  size?: number;
  maxValue?: number;
};

export const RadarChart: React.FC<Props> = ({
  punctuality,
  contributions,
  commitment,
  attitude,
  size = 220,
  maxValue = 5,
}) => {
  const center = size / 2;
  const radius = center - 30; // leave space for labels

  const axisPoints = [
    { x: center, y: center - radius },
    { x: center + radius, y: center },
    { x: center, y: center + radius },
    { x: center - radius, y: center },
  ];

  const values = [punctuality, contributions, commitment, attitude].map(
    (v) => Math.max(0, Math.min(v, maxValue)) / maxValue,
  );

  const dataPoints = axisPoints.map((pt, i) => ({
    x: center + (pt.x - center) * values[i],
    y: center + (pt.y - center) * values[i],
  }));

  const gridPaths = [] as string[];
  for (let level = 1; level <= 5; level++) {
    const r = (radius * level) / 5;
    const pts = [
      `${center},${center - r}`,
      `${center + r},${center}`,
      `${center},${center + r}`,
      `${center - r},${center}`,
    ];
    gridPaths.push(pts.join(" "));
  }

  const dataPath = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {gridPaths.map((d, i) => (
          <Polygon
            key={`g${i}`}
            points={d}
            fill="none"
            stroke="#3A2016"
            strokeWidth={1}
          />
        ))}

        {/* axes */}
        {axisPoints.map((pt, i) => (
          <Line
            key={`a${i}`}
            x1={center}
            y1={center}
            x2={pt.x}
            y2={pt.y}
            stroke="#3A2016"
            strokeWidth={1}
          />
        ))}

        {/* filled data */}
        <Polygon
          points={dataPath}
          fill="#9E9E9E57"
          stroke="#BDBDBD"
          strokeWidth={1.5}
        />
      </Svg>
      {/* Axis labels overlay */}
      <View style={styles.axisOverlay} pointerEvents="none">
        <Text style={styles.axisLabelTop}>Punc</Text>
        <View style={styles.axisLabelRightContainer}>
          <Text style={styles.axisLabel}>Cont</Text>
        </View>
        <Text style={styles.axisLabelBottom}>Comm</Text>
        <View style={styles.axisLabelLeftContainer}>
          <Text style={styles.axisLabel}>Atti</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  axisOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  axisLabelTop: {
    position: "absolute",
    top: 4,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "#FF8C60",
    fontSize: 11,
    fontWeight: "600",
  },
  axisLabelBottom: {
    position: "absolute",
    bottom: 4,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "#FF8C60",
    fontSize: 11,
    fontWeight: "600",
  },
  axisLabelRightContainer: {
    position: "absolute",
    right: 4,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  axisLabelLeftContainer: {
    position: "absolute",
    left: 4,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  axisLabel: {
    color: "#FF8C60",
    fontSize: 11,
    fontWeight: "600",
  },
});

export default RadarChart;
