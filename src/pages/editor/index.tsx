import { useAppSelector } from '@/hooks/redux'
import { getCanvasWidgetDsl } from '@/store/slices/canvasWidgetsStructureSlice'
import Canvas from './components/Canvas'
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { getCanvasWidth } from '@/selectors/editorSelectors';

export default function Editor() {

  const widgetsStructure = useAppSelector(getCanvasWidgetDsl);
  const canvasWidth = useAppSelector(getCanvasWidth)

  let nodeList: React.ReactNode = useMemo(() => {
    return <Canvas
      canvasWidth={canvasWidth}
      widgetsStructure={widgetsStructure}
    />
  }, [widgetsStructure])


  return (
    <>
      <div style={{
        height: "100vh"
      }}>
        <div>下面是选阿兰</div>
        {nodeList}
      </div>
    </>
  )
}