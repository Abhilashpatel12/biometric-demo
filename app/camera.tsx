import { useCallback, useEffect, useRef, useState } from "react";
import {
    Dimensions,
    Pressable,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    Camera,
    useCameraDevice,
    useCameraFormat,
    useCameraPermission,
} from "react-native-vision-camera";
import FlashOverlay from "../components/FlashOverlay";
import MetricsOverlay from "../components/MetricsOverlay";

import ResultOverlay from "../components/ResultOverlay";
import ScanAnimation from "../components/ScanAnimation";
import { COLORS, FONTS, TIMING } from "../constants/theme";
import {
    LivenessResult,
    useLivenessDetection,
} from "../hooks/useLivenessDetection";
import { DemoState, DemoType } from "../types/demo.types";

export default function CameraDemoScreen() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice("front");
  const format = useCameraFormat(device, [
    { videoResolution: { width: 1280, height: 720 } },
  ]);

  // Demo State
  const [demoState, setDemoState] = useState<DemoState>("idle");
  const [demoType, setDemoType] = useState<DemoType>("success");

  const [showFlash, setShowFlash] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Tap Gesture Tracking
  const tapCount = useRef(0);
  const lastTapTime = useRef(0);

  // ===== LIVENESS DETECTION CALLBACK =====
  // This is called directly from the worklet via Worklets.createRunOnJS
  const handleLivenessResult = useCallback(
    (result: LivenessResult) => {
      console.log("JS: handleLivenessResult called with:", result);

      // Only process if we're in idle state
      if (demoState !== "idle") {
        console.log("JS: Ignoring - not in idle state, currently:", demoState);
        return;
      }

      console.log("JS: Triggering demo sequence for:", result);
      setDemoType(result === "success" ? "success" : "photo");
      setDemoState("preparing");
    },
    [demoState],
  );

  // Liveness Detection Hook with callback
  const { frameProcessor, resetDetection } = useLivenessDetection({
    onResult: handleLivenessResult,
  });

  // Ref for manual triggers (triple tap)
  const startSequenceRef = useRef<(type: DemoType) => void>(() => {});

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // FAILSAFE: Force Engine Unlock on Idle
  useEffect(() => {
    if (demoState === "idle") {
      console.log("JS: State is IDLE -> Forcing Engine Unlock");
      resetDetection();
    }
  }, [demoState, resetDetection]);

  // Auto-Reset Result after 3 seconds
  useEffect(() => {
    if (demoState === "result") {
      const timer = setTimeout(() => {
        resetDemo();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [demoState]);

  const resetDemo = () => {
    console.log("JS: Resetting Demo...");
    setDemoState("idle");
    setStatusMessage(null);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    resetDetection();
  };

  const startDemoSequence = (type: DemoType) => {
    console.log("JS: startDemoSequence triggered for:", type);
    if (demoState !== "idle") return;

    setDemoType(type);
    setDemoState("preparing");

    // Logic branching
    if (type === "photo") {
      // Photo Rejected
      setStatusMessage("生体反応なし");
      timeoutRef.current = setTimeout(() => {
        setDemoState("result");
      }, 1000);
    } else {
      // Success (Live) or Deepfake (Manual)
      setStatusMessage("生体反応を確認中...");

      // Random delay before flash/scan
      const randomDelay =
        Math.random() * (TIMING.randomDelayMax - TIMING.randomDelayMin) +
        TIMING.randomDelayMin;
      timeoutRef.current = setTimeout(() => {
        setShowFlash(true);
      }, randomDelay);
    }
  };

  // Keep startSequenceRef updated so polling can trigger it
  useEffect(() => {
    startSequenceRef.current = startDemoSequence;
  });

  // React to State Changes (Logic decoupling)
  useEffect(() => {
    if (demoState === "preparing") {
      // Logic branching based on demoType
      if (demoType === "photo") {
        // Photo Rejected
        setStatusMessage("生体反応なし");
        timeoutRef.current = setTimeout(() => {
          setDemoState("result");
        }, 1000);
      } else {
        // Success (Live) or Deepfake (Manual)
        setStatusMessage("生体反応を確認中...");

        // Random delay before flash/scan
        const randomDelay =
          Math.random() * (TIMING.randomDelayMax - TIMING.randomDelayMin) +
          TIMING.randomDelayMin;
        timeoutRef.current = setTimeout(() => {
          setShowFlash(true);
        }, randomDelay);
      }
    }
  }, [demoState, demoType]);

  const onFlashComplete = () => {
    console.log("JS: Flash complete -> Starting SCAN ANIMATION");
    setShowFlash(false);
    setStatusMessage(null);
    setDemoState("scanning");

    // Scan Duration (3.5 seconds of scanning animation)
    timeoutRef.current = setTimeout(() => {
      console.log("JS: Scan complete -> Showing RESULT");
      setDemoState("result");
    }, 3500);
  };

  if (!hasPermission)
    return (
      <View style={styles.container}>
        <Text>カメラ権限を確認中...</Text>
      </View>
    );
  if (!device)
    return (
      <View style={styles.container}>
        <Text>カメラが見つかりません</Text>
      </View>
    );

  const handleTap = (evt: any) => {
    const now = Date.now();
    const locationX = evt.nativeEvent.locationX;
    const screenWidth = Dimensions.get("window").width;

    // GLOBAL TAP COUNTER (Works in ANY state to unfreeze app)
    if (now - lastTapTime.current < 500) {
      tapCount.current += 1;
    } else {
      tapCount.current = 1;
    }
    lastTapTime.current = now;

    // 1. Double Tap -> FORCE RESET (Panic Button)
    if (tapCount.current === 2) {
      console.log("JS: Double Tap -> Manual Reset");
      resetDemo();
    }

    // 2. Triple Tap -> Hidden Override (Triggers Flow)
    if (tapCount.current === 3) {
      console.log("JS: Triple Tap Detected!");
      if (locationX < screenWidth / 2) {
        console.log("JS: Left Side -> Force SUCCESS");
        startSequenceRef.current("success");
      } else {
        console.log("JS: Right Side -> Force PHOTO ATTACK");
        startSequenceRef.current("photo");
      }
      tapCount.current = 0; // Reset counter
    }

    // 3. Single Tap on Result Screen (Preserve old behavior)
    if (tapCount.current === 1 && demoState === "result") {
      resetDemo();
    }
  };

  return (
    <Pressable onPress={handleTap} style={styles.container}>
      <View style={styles.container}>
        <StatusBar hidden />

        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          format={format}
          isActive={true}
          outputOrientation="preview"
          {...(frameProcessor ? { frameProcessor } : {})}
          pixelFormat="yuv" // High performance
        />

        {/* Overlays */}
        {demoState === "idle" && (
          <View style={styles.idleOverlay}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />

            {/* MANUAL OVERRIDE: Deepfake (Bottom-Left) */}
            <TouchableOpacity
              style={[styles.tapZone, styles.bottomLeft]}
              onPress={() => startDemoSequence("deepfake")}
            />
          </View>
        )}

        {/* {demoState === 'preparing' && statusMessage && (
                    <View style={styles.statusContainer}>
                        <Text style={styles.statusText}>{statusMessage}</Text>
                    </View>
                )} */}

        {demoState === "scanning" && <ScanAnimation />}

        {/* <PupilSizeIndicator demoState={demoState} demoType={demoType} /> */}

        {(demoState === "scanning" || demoState === "result") && (
          <MetricsOverlay
            demoType={demoType}
            isScanning={demoState === "scanning"}
          />
        )}

        <FlashOverlay visible={showFlash} onComplete={onFlashComplete} />
        <ResultOverlay
          visible={demoState === "result"}
          type={demoType}
          onReset={resetDemo}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>特許出願中</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  idleOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  idleText: {
    color: COLORS.white,
    fontFamily: FONTS.monospace,
    fontSize: 14,
    marginTop: 20,
    letterSpacing: 2,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 5,
  },
  tapZone: {
    position: "absolute",
    width: 100,
    height: 100,
    zIndex: 50,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
  },
  statusContainer: {
    position: "absolute",
    top: "40%",
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 20,
    borderRadius: 10,
    zIndex: 15,
  },
  statusText: {
    color: COLORS.white,
    fontFamily: FONTS.monospace,
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
  },
  footerText: {
    fontFamily: FONTS.monospace,
    fontSize: 10,
    color: COLORS.white,
    opacity: 0.5,
  },
  cornerTL: {
    position: "absolute",
    top: "30%",
    left: "15%",
    width: 40,
    height: 40,
    borderColor: COLORS.cyan,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  cornerTR: {
    position: "absolute",
    top: "30%",
    right: "15%",
    width: 40,
    height: 40,
    borderColor: COLORS.cyan,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  cornerBL: {
    position: "absolute",
    bottom: "30%",
    left: "15%",
    width: 40,
    height: 40,
    borderColor: COLORS.cyan,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  cornerBR: {
    position: "absolute",
    bottom: "30%",
    right: "15%",
    width: 40,
    height: 40,
    borderColor: COLORS.cyan,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
});
