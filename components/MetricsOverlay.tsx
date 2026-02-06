import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS, FONTS } from "../constants/theme";

interface MetricsOverlayProps {
  demoType: "success" | "photo" | "deepfake";
  isScanning: boolean;
}

export default function MetricsOverlay({
  demoType,
  isScanning,
}: MetricsOverlayProps) {
  const [latency, setLatency] = useState(0);
  const [fps, setFps] = useState(0);
  const [signal, setSignal] = useState(0);
  const [bars, setBars] = useState<number[]>(Array(12).fill(0.1));

  // Check if this is a failed detection (photo or non-human)
  const isFailed = demoType === "photo" || demoType === "deepfake";

  useEffect(() => {
    if (!isScanning) return;

    const interval = setInterval(() => {
      if (isFailed) {
        // Photo/Non-human detected: show flat/zero metrics
        setLatency(0);
        setFps(0);
        setSignal(0);
        setBars(Array(12).fill(0.05)); // Near-zero flat bars
      } else {
        // Live human: show active metrics
        setLatency(Math.floor(180 + Math.random() * 80)); // 180-260ms
        setFps(Math.floor(28 + Math.random() * 6)); // 28-34 fps
        setSignal(Math.floor(95 + Math.random() * 5)); // 95-100%
        setBars(Array.from({ length: 12 }, () => Math.random() * 0.7 + 0.3));
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isScanning, isFailed]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>- メトリクス -</Text>

      {/* Bar visualization */}
      <View style={styles.barsContainer}>
        {bars.map((height, index) => (
          <View
            key={index}
            style={[
              styles.bar,
              {
                height: height * 40,
                backgroundColor: isFailed ? COLORS.red : COLORS.cyan,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.metricsContainer}>
        <Text
          style={{
            color: "#FFFFFF",
            fontFamily: FONTS.monospace,
            fontSize: 11,
          }}
        >
          遅延: {latency}ms
        </Text>
        <Text
          style={{
            color: "#FFFFFF",
            fontFamily: FONTS.monospace,
            fontSize: 11,
          }}
        >
          フレームレート: {fps}
        </Text>
        <Text
          style={{
            color: "#FFFFFF",
            fontFamily: FONTS.monospace,
            fontSize: 11,
          }}
        >
          信号強度: {signal}%
        </Text>
      </View>

      {/* Status indicator */}
      {isFailed && (
        <Text
          style={{
            color: "#FFFFFF",
            fontFamily: FONTS.monospace,
            fontSize: 10,
            textAlign: "center",
            marginTop: 8,
            fontWeight: "bold",
          }}
        >
          生体反応なし
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "rgba(0, 20, 30, 0.85)",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.cyan,
    minWidth: 140,
  },
  title: {
    color: COLORS.cyan,
    fontFamily: FONTS.monospace,
    fontSize: 12,
    textAlign: "center",
    marginBottom: 8,
  },
  barsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 40,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  bar: {
    width: 6,
    borderRadius: 2,
  },
  metricsContainer: {
    gap: 4,
  },
  metricText: {
    color: "#FFFFFF",
    fontFamily: FONTS.monospace,
    fontSize: 11,
  },
  failedText: {
    color: "#FFFFFF",
  },
  failedStatus: {
    color: COLORS.red,
    fontFamily: FONTS.monospace,
    fontSize: 10,
    textAlign: "center",
    marginTop: 8,
    fontWeight: "bold",
  },
});
