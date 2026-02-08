import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS, FONTS } from "../constants/theme";

export default function LaunchScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.systemContainer}>
          {/* Decorative Brackets */}
          <View style={[styles.bracket, styles.bracketTopLeft]} />
          <View style={[styles.bracket, styles.bracketTopRight]} />
          <View style={[styles.bracket, styles.bracketBottomLeft]} />
          <View style={[styles.bracket, styles.bracketBottomRight]} />

          <View style={styles.decorativeLine} />

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => router.push("/camera")}
          >
            {({ pressed }) => (
              <Text
                style={[styles.buttonText, pressed && styles.buttonTextPressed]}
              >
                入室
              </Text>
            )}
          </Pressable>

          <View style={styles.decorativeLine} />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>特許出願中</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  decorativeLine: {
    height: 1,
    backgroundColor: COLORS.darkGreen,
    width: "100%",
    marginVertical: 40,
    opacity: 0.5,
  },
  systemContainer: {
    alignItems: "center",
    paddingVertical: 20,
    width: "100%",
  },
  title: {
    fontFamily: FONTS.monospace,
    fontSize: 28,
    color: COLORS.green,
    textAlign: "center",
    letterSpacing: 6,
    marginVertical: 30,
    lineHeight: 40,
    fontWeight: "bold",
  },
  bracket: {
    position: "absolute",
    width: 20,
    height: 20,
    borderColor: COLORS.green,
    opacity: 0.6,
  },
  bracketTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  bracketTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  bracketBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  bracketBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  button: {
    backgroundColor: "transparent",
    borderColor: COLORS.green,
    borderWidth: 2,
    paddingHorizontal: 60,
    paddingVertical: 16,
    marginVertical: 40, // Added vertical margin for better bracket spacing
  },
  buttonPressed: {
    backgroundColor: COLORS.green,
    opacity: 0.8,
  },
  buttonText: {
    fontFamily: FONTS.monospace,
    fontSize: 16,
    color: COLORS.green,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  buttonTextPressed: {
    color: COLORS.background,
  },
  footer: {
    paddingBottom: 40,
    alignItems: "center",
  },
  footerText: {
    fontFamily: FONTS.monospace,
    fontSize: 10,
    color: COLORS.white,
    opacity: 0.4,
    letterSpacing: 1,
  },
});
