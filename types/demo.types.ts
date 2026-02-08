export type DemoState =
  | "waiting"
  | "idle"
  | "preparing"
  | "scanning"
  | "result";

export type DemoType = "success" | "photo" | "deepfake";

export type WaveformPattern = "active" | "flat" | "erratic";

export interface MetricsData {
  latency: number;
  fps: number;
  signal: number;
}
