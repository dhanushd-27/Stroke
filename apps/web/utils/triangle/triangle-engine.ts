import { Point, getDistance } from "./triangle-math";
import { SNAP_DISTANCE } from "./triangle-constants";

// Check if a point is close enough to a vertex to snap/complete
export const checkVertexProximity = (
  point: Point,
  vertices: Point[],
): { index: number; vertex: Point } | null => {
  for (let i = 0; i < vertices.length; i++) {
    if (getDistance(point, vertices[i]!) < SNAP_DISTANCE) {
      return { index: i, vertex: vertices[i]! };
    }
  }
  return null;
};

// Validates if the movement is generally forward (simple anti-backtracking)
export const validateMovement = (
  currentPoint: Point,
  lastPoint: Point,
  targetVertex: Point,
) => {
  const currentDist = getDistance(currentPoint, targetVertex);
  const lastDist = getDistance(lastPoint, targetVertex);
  // Allow small backwards jitter but generally should get closer or maintain distance
  // This is a loose check; strict backtracking can be complex on corners
  return currentDist <= lastDist + 5;
};
