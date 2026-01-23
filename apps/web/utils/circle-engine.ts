import { Point, getAngleDiff } from "./canvas-math";
import {
  AXIS_STOP_THRESHOLD,
  DIRECTION_SETTLE_POINTS,
} from "./canvas-constants";

export function checkBacktracking(
  currentAngle: number,
  lastAngle: number,
  direction: number,
  pointsCount: number,
): { isReversing: boolean; delta: number } {
  let delta = currentAngle - lastAngle;
  if (delta > Math.PI) delta -= 2 * Math.PI;
  if (delta < -Math.PI) delta += 2 * Math.PI;

  if (direction !== 0 && pointsCount > DIRECTION_SETTLE_POINTS) {
    const isReversing = direction === 1 ? delta < -0.05 : delta > 0.05;
    return { isReversing, delta };
  }

  return { isReversing: false, delta };
}

export function checkAxisStop(
  currentAngle: number,
  startAngle: number,
): boolean {
  return getAngleDiff(currentAngle, startAngle) < AXIS_STOP_THRESHOLD;
}
