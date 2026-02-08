import { useCallback, useEffect, useRef, useState } from "react";
import {
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
import { COLORS, FONTS } from "../constants/theme";
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
  const [demoState, setDemoState] = useState<DemoState>("waiting");
  const [demoType, setDemoType] = useState<DemoType>("success");

  const [showFlash, setShowFlash] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Deepfake triple-tap tracking
  const deepfakeTapCount = useRef(0);
  const deepfakeLastTap = useRef(0);

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
  const startSequenceRef = useRef<(type: DemoType) => void>(() => { });

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

  // Result stays fixed until user presses Reset button

  const resetDemo = () => {
    console.log("JS: Resetting Demo...");
    setDemoState("waiting");
    setStatusMessage(null);
    setShowFlash(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    resetDetection();
  };

  const startDetection = () => {
    console.log("JS: Start button pressed -> Begin detection");
    resetDetection();
    setDemoState("idle");
  };

  const startDemoSequence = (type: DemoType) => {
    console.log("JS: startDemoSequence triggered for:", type);
    if (demoState !== "idle" && demoState !== "waiting") return;

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

      // Trigger flash immediately (no delay)
      setShowFlash(true);
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

        // Trigger flash immediately (no delay)
        setShowFlash(true);
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

  return (
    <View style={styles.container}>
      <View style={styles.container}>
        <StatusBar hidden />

        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          format={format}
          isActive={true}
          outputOrientation="preview"
          androidPreviewViewType="texture-view"
          {...(demoState === "idle" && frameProcessor
            ? { frameProcessor }
            : {})}
          pixelFormat="yuv" // High performance
        />

        {/* Overlays */}
        {(demoState === "waiting" ||
          demoState === "idle" ||
          demoState === "preparing") && (
            <View style={styles.idleOverlay}>
              <View style={styles.cornerTL} />
              <View style={styles.cornerTR} />
              <View style={styles.cornerBL} />
              <View style={styles.cornerBR} />

              {/* Start Button - only in waiting state */}
              {demoState === "waiting" && (
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={startDetection}
                  activeOpacity={0.7}
                >
                  <Text style={styles.startButtonText}>スタート</Text>
                </TouchableOpacity>
              )}

              {/* Scanning indicator - only in idle/detection state */}
              {demoState === "idle" && (
                <Text style={styles.idleText}>検出中...</Text>
              )}

              {/* MANUAL OVERRIDE: Deepfake (Bottom-Left) - Triple tap */}
              {demoState === "idle" && (
                <TouchableOpacity
                  style={[styles.tapZone, styles.bottomLeft]}
                  onPress={() => {
                    const now = Date.now();
                    if (now - deepfakeLastTap.current < 500) {
                      deepfakeTapCount.current += 1;
                    } else {
                      deepfakeTapCount.current = 1;
                    }
                    deepfakeLastTap.current = now;
                    if (deepfakeTapCount.current >= 3) {
                      deepfakeTapCount.current = 0;
                      startDemoSequence("deepfake");
                    }
                  }}
                />
              )}
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
    </View>
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
  startButton: {
    position: "absolute",
    bottom: 80,
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 40,
    backgroundColor: COLORS.green,
    borderRadius: 12,
  },
  startButtonText: {
    fontFamily: FONTS.monospace,
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.background,
    letterSpacing: 4,
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
