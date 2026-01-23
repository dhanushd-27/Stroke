export type Point = {
  x: number;
  y: number;
};

export const getDistance = (p1: Point, p2: Point) =>
  Math.hypot(p2.x - p1.x, p2.y - p1.y);

export const getAngle = (p: Point, center: { cx: number; cy: number }) =>
  Math.atan2(p.y - center.cy, p.x - center.cx);

export const getAngleDiff = (angle1: number, angle2: number) => {
  let diff = Math.abs(angle1 - angle2);
  if (diff > Math.PI) diff = 2 * Math.PI - diff;
  return diff;
};

export const calculatePrecision = (
  pts: Point[],
  center: { cx: number; cy: number },
) => {
  if (pts.length < 10) return null;

  const distances = pts.map((p) =>
    Math.hypot(p.x - center.cx, p.y - center.cy),
  );
  const meanRadius = distances.reduce((a, b) => a + b, 0) / distances.length;
  const variance =
    distances.reduce((sum, d) => sum + Math.pow(d - meanRadius, 2), 0) /
    distances.length;
  const stdDev = Math.sqrt(variance);
  const normalized = Math.max(0, 1 - stdDev / meanRadius);
  return Math.round(normalized * 100);
};
