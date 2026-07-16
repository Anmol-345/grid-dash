import { telemetry } from "./TelemetryManager";

export interface SessionPayload {
  score: number;
  accuracy: number;
  hits: number;
  misses: number;
  peakStreak: number;
  avgTimePerTarget: number;
}

export function exportSession() {
  const snapshot = telemetry.snapshot();
  
  const payload: SessionPayload = {
    score: snapshot.score,
    accuracy: snapshot.accuracy,
    hits: snapshot.hits,
    misses: snapshot.misses,
    peakStreak: snapshot.peakStreak,
    avgTimePerTarget: snapshot.avgTimePerTarget,
  };

  const event = new CustomEvent<SessionPayload>("aimtrainer:sessionComplete", {
    detail: payload,
  });

  window.dispatchEvent(event);
  
  console.log("[SessionExporter] Session exported:", payload);
}
