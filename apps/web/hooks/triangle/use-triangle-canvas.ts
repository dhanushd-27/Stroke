"use client";

import { useCallback, useRef, useState } from "react";
import { useCanvasScale } from "../use-canvas-scale";
import { useCanvasRender } from "../use-canvas-render";
import { useCurrentShapeStore } from "../../stores/currentShape-store";
import {
  Point,
  getTriangleVertices,
  calculateStraightnessScore,
} from "../../utils/triangle/triangle-math";
import {
  TRIANGLE_SIZE,
  MIN_EDGE_LENGTH,
} from "../../utils/triangle/triangle-constants";
import { checkVertexProximity } from "../../utils/triangle/triangle-engine";

export type GameStatus = "idle" | "drawing" | "finished";
export type CompletionStatus = "incomplete" | "success" | null;

export function useTriangleCanvas() {
  const { canvasRef, containerRef, canvasSize } = useCanvasScale();
  const { setScore } = useCurrentShapeStore();

  // State
  const [status, setStatus] = useState<GameStatus>("idle");
  const [completionStatus, setCompletionStatus] =
    useState<CompletionStatus>(null);
  const [currentEdge, setCurrentEdge] = useState<Point[]>([]);
  const [completedEdges, setCompletedEdges] = useState<Point[][]>([]);
  const [visitedVertices, setVisitedVertices] = useState<number[]>([]);

  // Refs
  const verticesRef = useRef<Point[]>([]);
  const lastPointRef = useRef<Point | null>(null);

  // Initialize vertices based on canvas size
  const getVertices = useCallback(() => {
    return getTriangleVertices(
      canvasSize.width / 2,
      canvasSize.height / 2,
      Math.min(canvasSize.width * 0.8, TRIANGLE_SIZE),
    );
  }, [canvasSize]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    const style = getComputedStyle(canvas);
    const primaryColor =
      style.getPropertyValue("--color-text-primary").trim() || "#131313";
    const mutedColor =
      style.getPropertyValue("--color-text-muted").trim() || "#646464";

    const vertices = getVertices();
    verticesRef.current = vertices;

    // Draw reference vertices
    vertices.forEach((v, i) => {
      ctx.beginPath();
      ctx.arc(v.x, v.y, 4, 0, Math.PI * 2);
      // Highlight visited vertices or next target?
      ctx.fillStyle = visitedVertices.includes(i) ? primaryColor : mutedColor;
      ctx.fill();
    });

    // Draw completed edges
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    completedEdges.forEach((edge) => {
      if (edge.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(edge[0]!.x, edge[0]!.y);
      for (let i = 1; i < edge.length; i++) ctx.lineTo(edge[i]!.x, edge[i]!.y);
      ctx.stroke();
    });

    // Draw current edge
    if (currentEdge.length > 0) {
      ctx.beginPath();
      ctx.moveTo(currentEdge[0]!.x, currentEdge[0]!.y);
      for (let i = 1; i < currentEdge.length; i++)
        ctx.lineTo(currentEdge[i]!.x, currentEdge[i]!.y);
      ctx.stroke();
    }
  }, [
    canvasRef,
    canvasSize,
    visitedVertices,
    completedEdges,
    currentEdge,
    getVertices,
  ]);

  useCanvasRender(draw, [draw]);

  const startDrawing = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (status === "finished") {
        // Reset
        setStatus("idle");
        setCompletionStatus(null);
        setCompletedEdges([]);
        setCurrentEdge([]);
        setVisitedVertices([]);
        setScore(null);
        return;
      }

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const point = { x, y };

      // Must start at a vertex
      const snap = checkVertexProximity(point, verticesRef.current);
      if (snap) {
        setStatus("drawing");
        setVisitedVertices([snap.index]);
        setCurrentEdge([snap.vertex]);
        lastPointRef.current = snap.vertex;
      }
    },
    [status, setScore],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (status !== "drawing") return;
      if (e.buttons !== 1) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const point = { x, y };

      setCurrentEdge((prev) => [...prev, point]);
      lastPointRef.current = point;

      // Check if we hit a vertex
      const snap = checkVertexProximity(point, verticesRef.current);
      if (snap) {
        const lastVertexIndex = visitedVertices[visitedVertices.length - 1];
        if (snap.index !== lastVertexIndex) {
          if (visitedVertices.includes(snap.index)) {
            // We allow revisiting the START vertex, but we DO NOT finish here.
            // We finish only on stopDrawing (mouseup).
            // If we revisit other vertices, it might be a fail or just ignore.
            // For now, let's allow "closing the loop" logic to prepare for mouseup.
            return;
          }

          // Valid new vertex connection
          // Split the edge here for scoring purposes, but don't add the snap vertex to the drawing path
          // The user's path is 'currentEdge' which leads "close enough" to the vertex.

          setVisitedVertices((prev) => [...prev, snap.index]);

          // We archive the current edge as a completed segment
          // We DO NOT append snap.vertex, preserving the user's raw input
          setCompletedEdges((prev) => [...prev, currentEdge]);

          // Start new edge with the last point to prevent a visual gap
          setCurrentEdge([point]);
        }
      }
    },
    [status, visitedVertices, currentEdge],
  );

  const stopDrawing = useCallback(() => {
    if (status === "drawing") {
      // Check for success condition:
      // 1. Visited all 3 vertices
      // 2. Current position (lastPointRef) is close to Start Vertex

      const startVertexIndex = visitedVertices[0];
      const uniqueVisited = new Set(visitedVertices);
      const visitedAll = uniqueVisited.size === 3;

      if (
        visitedAll &&
        startVertexIndex !== undefined &&
        lastPointRef.current
      ) {
        const startVertex = verticesRef.current[startVertexIndex];
        if (startVertex) {
          const distToStart = Math.hypot(
            lastPointRef.current.x - startVertex.x,
            lastPointRef.current.y - startVertex.y,
          );

          if (distToStart < 20) {
            // SNAP_DISTANCE
            // Success!
            const finalEdges = [...completedEdges, currentEdge];
            finishGame("success", finalEdges);
            return;
          }
        }
      }

      setStatus("finished");
      setCompletionStatus("incomplete");
    }
  }, [status, visitedVertices, completedEdges, currentEdge]);

  const finishGame = (result: CompletionStatus, finalEdges?: Point[][]) => {
    setStatus("finished");
    setCompletionStatus(result);

    if (result === "success" && finalEdges) {
      let totalStraightness = 0;
      const vertices = verticesRef.current;

      // Calculate straightness for each edge
      finalEdges.forEach((edge) => {
        if (edge.length < 2) return;
        const start = edge[0]!;
        const end = edge[edge.length - 1]!;
        totalStraightness += calculateStraightnessScore(edge, start, end);
      });

      const avgStraightness = totalStraightness / 3;

      // For this version, we'll weight straightness heavily as it's the primary mechanic
      // Angle calculation can be added as a refinement if improved
      const finalScore = Math.round(avgStraightness);
      setScore(finalScore);
    }
  };

  return {
    canvasRef,
    containerRef,
    status,
    completionStatus,
    startDrawing,
    stopDrawing,
    handlePointerMove,
  };
}
