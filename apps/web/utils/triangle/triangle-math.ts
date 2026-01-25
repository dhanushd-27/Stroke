export type Point = {
  x: number;
  y: number;
};

// Calculate distance between two points
export const getDistance = (p1: Point, p2: Point) =>
  Math.hypot(p2.x - p1.x, p2.y - p1.y);

// Calculate angle between three points (vertex is p2)
export const getAngle = (p1: Point, p2: Point, p3: Point) => {
  const a = getDistance(p2, p3);
  const b = getDistance(p1, p3);
  const c = getDistance(p1, p2);
  // Law of Cosines
  const cosAngle = (a * a + c * c - b * b) / (2 * a * c);
  return Math.acos(Math.max(-1, Math.min(1, cosAngle))); // Clamp for safety
};

// Calculate perpendicular distance from point p to line segment v1-v2
export const getDistanceToLine = (p: Point, v1: Point, v2: Point) => {
  const l2 = Math.pow(getDistance(v1, v2), 2);
  if (l2 === 0) return getDistance(p, v1);
  const t = ((p.x - v1.x) * (v2.x - v1.x) + (p.y - v1.y) * (v2.y - v1.y)) / l2;
  const tClamped = Math.max(0, Math.min(1, t));
  const projection = {
    x: v1.x + tClamped * (v2.x - v1.x),
    y: v1.y + tClamped * (v2.y - v1.y),
  };
  return getDistance(p, projection);
};

// Convert degrees to radians
export const toRad = (deg: number) => (deg * Math.PI) / 180;
// Convert radians to degrees
export const toDeg = (rad: number) => (rad * 180) / Math.PI;

// Get vertices for an equilateral triangle centered at (cx, cy)
export const getTriangleVertices = (
  cx: number,
  cy: number,
  sideLength: number,
): Point[] => {
  const height = (Math.sqrt(3) / 2) * sideLength;
  // Top vertex
  const p1 = { x: cx, y: cy - (2 / 3) * height };
  // Bottom Right
  const p2 = { x: cx + sideLength / 2, y: cy + (1 / 3) * height };
  // Bottom Left
  const p3 = { x: cx - sideLength / 2, y: cy + (1 / 3) * height };
  return [p1, p2, p3];
};

// Calculate Straightness Score for an edge
export const calculateStraightnessScore = (
  drawnPoints: Point[],
  startVertex: Point,
  endVertex: Point,
) => {
  if (drawnPoints.length < 2) return 0;

  // Sample points to reduce computation if needed, but for < 1000 points O(N) is fine
  const deviations = drawnPoints.map((p) =>
    getDistanceToLine(p, startVertex, endVertex),
  );

  const avgDeviation =
    deviations.reduce((a, b) => a + b, 0) / deviations.length;
  // Map deviation to score: 0px deviation = 100%, 20px deviation = 0%
  const score = Math.max(0, 100 - avgDeviation * 5);
  return Math.round(score);
};

export const calculateAngleScore = (drawnAngle: number, idealAngle: number) => {
  const diffuse = Math.abs(toDeg(drawnAngle) - toDeg(idealAngle));
  // Allow 5 degrees tolerance for perfect score, then penalty
  if (diffuse <= 5) return 100;
  return Math.max(0, 100 - (diffuse - 5) * 3);
};
