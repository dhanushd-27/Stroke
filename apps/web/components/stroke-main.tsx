import React from 'react'
import CanvasNav from './canvas/canvas-nav'
import { Shape, useCurrentShapeStore } from '../stores/currentShape-store'
import CircleCanvas from './circle/circle-canvas'
import TriangleCanvas from './triangle/triangle-canvas'

export default function StrokeMain() {
  const shape = useCurrentShapeStore((state) => state.shape)

  return (
    <>
      {shape === Shape.None && <CanvasNav />}
      {shape === Shape.Circle && <CircleCanvas />}
      {shape === Shape.Triangle && <TriangleCanvas />}
    </>
  )
}
