import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";
import { COLORS, FONTS } from "../constants/theme";
import { DemoType } from "../types/demo.types";

interface ResultOverlayProps {
  visible: boolean;
  type: DemoType;
  onReset?: () => void;
}

const ResultOverlay: React.FC<ResultOverlayProps> = ({
  visible,
  type,
  onReset,
}) => {
  if (!visible) return null;

  const renderResetButton = () => (
    <TouchableOpacity
      style={styles.resetButton}
      onPress={onReset}
      activeOpacity={0.7}
    >
      <Text style={styles.resetButtonText}>リセット</Text>
    </TouchableOpacity>
  );

  const renderContent = () => {
    switch (type) {
      case "success":
        return (
          <Animated.View entering={ZoomIn.springify()} style={styles.container}>
            <Text
              style={[
                styles.mainText,
                {
                  color: COLORS.green,
                },
              ]}
            >
              認証成功
            </Text>
            {renderResetButton()}
          </Animated.View>
        );

      case "photo":
        return (
          <Animated.View entering={ZoomIn.springify()} style={styles.container}>
            <Text
              style={[
                styles.mainText,
                {
                  color: COLORS.red,
                },
              ]}
            >
              認証拒否
            </Text>
            <Text
              style={[
                styles.subText,
                {
                  color: COLORS.red,
                },
              ]}
            >
              写真検出
            </Text>
            {renderResetButton()}
          </Animated.View>
        );

      case "deepfake":
        return (
          <Animated.View entering={ZoomIn.springify()} style={styles.container}>
            <Text
              style={[
                styles.mainText,
                {
                  color: COLORS.red,
                },
              ]}
            >
              タイミング異常
            </Text>
            <Text
              style={[
                styles.subText,
                {
                  color: COLORS.red,
                },
              ]}
            >
              AI検出
            </Text>
            {renderResetButton()}
          </Animated.View>
        );

      default:
        return null;
    }
  };

  return renderContent();
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: "40%",
    left: 20,
    right: 20,
    alignItems: "center",
    zIndex: 60,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    paddingVertical: 40,
    paddingHorizontal: 30,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: COLORS.cyan,
    shadowColor: COLORS.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 20,
    elevation: 20,
  },
  mainText: {
    fontFamily: FONTS.monospace,
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 2,
    marginBottom: 20,
    textAlign: "center",
  },
  subText: {
    fontFamily: FONTS.monospace,
    fontSize: 20,
    letterSpacing: 2,
    marginTop: 8,
  },
  resetButton: {
    marginTop: 30,
    paddingVertical: 12,
    paddingHorizontal: 40,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: COLORS.cyan,
    borderRadius: 8,
  },
  resetButtonText: {
    fontFamily: FONTS.monospace,
    fontSize: 16,
    color: COLORS.cyan,
    letterSpacing: 2,
    fontWeight: "bold",
  },
});

export default ResultOverlay;
