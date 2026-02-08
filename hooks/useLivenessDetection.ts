import { useEffect, useRef } from "react";
import { useFrameProcessor } from "react-native-vision-camera";
import {
  type FrameFaceDetectionOptions,
  useFaceDetector,
} from "react-native-vision-camera-face-detector";
import { useSharedValue, Worklets } from "react-native-worklets-core";

// Strict thresholds for reliable photo detection
const EYE_OPEN_THRESHOLD = 0.6;
const EYE_CLOSED_THRESHOLD = 0.35;
const MIN_CLOSED_FRAMES = 2;
const MIN_OPEN_FRAMES = 3;

// Extended timeouts for easier user experience
const MIN_DETECTION_FRAMES = 15; // Start checking slightly sooner
const NO_FACE_TIMEOUT_FRAMES = 90; // ~3 seconds to position face
const PHOTO_TIMEOUT_FRAMES = 230; // ~7 seconds to blink

export type LivenessResult = "success" | "photo";

interface UseLivenessDetectionProps {
  onResult: (result: LivenessResult) => void;
}

export const useLivenessDetection = ({
  onResult,
}: UseLivenessDetectionProps) => {
  const callOnResult = Worklets.createRunOnJS((result: LivenessResult) => {
    console.log("[LIVENESS-JS] Received result from worklet:", result);
    onResult(result);
  });

  // Detection state (worklets-core SharedValues)
  const isFinished = useSharedValue(false);
  const totalFrames = useSharedValue(0);
  const faceDetectedFrames = useSharedValue(0);
  const noFaceFrames = useSharedValue(0);

  const eyesClosedFrames = useSharedValue(0);
  const eyesOpenFrames = useSharedValue(0);
  const eyesWereOpen = useSharedValue(false);
  const blinkDetected = useSharedValue(false);

  const faceDetectionOptions = useRef<FrameFaceDetectionOptions>({
    performanceMode: "fast",
    contourMode: "none",
    landmarkMode: "none",
    classificationMode: "all",
    minFaceSize: 0.15,
    trackingEnabled: false,
  }).current;

  const { detectFaces } = useFaceDetector(faceDetectionOptions);

  useEffect(() => {
    console.log("[LIVENESS] Hook initialized - Blink-only detection");
  }, []);

  const frameProcessor = useFrameProcessor(
    (frame) => {
      "worklet";

      if (isFinished.value) return;

      totalFrames.value += 1;

      try {
        const faces = detectFaces(frame);

        // === NO FACE DETECTED ===
        if (faces.length === 0) {
          noFaceFrames.value += 1;

          if (totalFrames.value % 30 === 1) {
            console.log(
              `[LIVENESS] Frame ${totalFrames.value} | NO FACE | ${noFaceFrames.value}/${NO_FACE_TIMEOUT_FRAMES}`,
            );
          }

          if (noFaceFrames.value >= NO_FACE_TIMEOUT_FRAMES) {
            console.log(
              `[LIVENESS] NON-HUMAN - No face after ${noFaceFrames.value} frames`,
            );
            isFinished.value = true;
            callOnResult("photo");
            return;
          }
          return;
        }

        noFaceFrames.value = 0;
        faceDetectedFrames.value += 1;

        const face = faces[0];
        const leftEyeOpen = face.leftEyeOpenProbability ?? -1;
        const rightEyeOpen = face.rightEyeOpenProbability ?? -1;

        if (leftEyeOpen >= 0 && rightEyeOpen >= 0) {
          const avgEyeOpen = (leftEyeOpen + rightEyeOpen) / 2;
          const eyesOpen = avgEyeOpen > EYE_OPEN_THRESHOLD;
          const eyesClosed = avgEyeOpen < EYE_CLOSED_THRESHOLD;

          if (eyesOpen) {
            eyesOpenFrames.value += 1;
            if (eyesOpenFrames.value >= MIN_OPEN_FRAMES) {
              eyesWereOpen.value = true;
            }

            if (
              eyesClosedFrames.value >= MIN_CLOSED_FRAMES &&
              eyesWereOpen.value &&
              !blinkDetected.value
            ) {
              console.log(`[LIVENESS] BLINK DETECTED!`);
              blinkDetected.value = true;
            }
            eyesClosedFrames.value = 0;
          } else if (eyesClosed && eyesWereOpen.value) {
            eyesClosedFrames.value += 1;
            eyesOpenFrames.value = 0;
          }
        }

        if (totalFrames.value % 30 === 1) {
          console.log(
            `[LIVENESS] Frame ${faceDetectedFrames.value}/${PHOTO_TIMEOUT_FRAMES} | Eyes L:${leftEyeOpen.toFixed(2)} R:${rightEyeOpen.toFixed(2)} | Blink:${blinkDetected.value}`,
          );
        }

        if (faceDetectedFrames.value < MIN_DETECTION_FRAMES) return;

        if (blinkDetected.value) {
          console.log(
            `[LIVENESS] SUCCESS - Blink detected at frame ${faceDetectedFrames.value}`,
          );
          isFinished.value = true;
          callOnResult("success");
          return;
        }

        if (faceDetectedFrames.value >= PHOTO_TIMEOUT_FRAMES) {
          console.log(
            `[LIVENESS] PHOTO - No blink after ${faceDetectedFrames.value} frames`,
          );
          isFinished.value = true;
          callOnResult("photo");
          return;
        }
      } catch (error) {
        console.log("[LIVENESS] Error:", error);
      }
    },
    [detectFaces, callOnResult],
  );

  const resetDetection = () => {
    console.log("[LIVENESS] Resetting...");
    isFinished.value = false;
    totalFrames.value = 0;
    faceDetectedFrames.value = 0;
    noFaceFrames.value = 0;
    eyesClosedFrames.value = 0;
    eyesOpenFrames.value = 0;
    eyesWereOpen.value = false;
    blinkDetected.value = false;
  };

  return {
    frameProcessor,
    resetDetection,
  };
};
