"use client"
import { Button } from '@repo/ui/button'
import React from 'react'
import { useCurrentShapeStore, Shape } from '../../stores/currentShape-store'

export default function CanvasNav() {
  const setShape = useCurrentShapeStore((state) => state.setShape)

  return (
    <div className='flex flex-col items-center justify-center gap-4'>
      <h4>
        Choose a shape you want to stroke
      </h4>
      <div className='flex gap-4'>
        <Button variant='text' onClick={() => setShape(Shape.Circle)}>Circle</Button>
        <Button variant='text' onClick={() => setShape(Shape.Triangle)}>Triangle</Button>
      </div>
    </div>
  )
}
