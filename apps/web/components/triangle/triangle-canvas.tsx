import { Button } from '@repo/ui/button'
import { Shape, useCurrentShapeStore } from '../../stores/currentShape-store'

export default function TriangleCanvas() {
  const setShape = useCurrentShapeStore((state) => state.setShape)

  return (
    <div className='flex items-center justify-center relative flex-col gap-4'>
      <div className='text-xs'>Coming Soon!</div>
      <Button variant='text' onClick={() => setShape(Shape.None)}>Back</Button>
    </div>
  )
}
