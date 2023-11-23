import WidgetFactory from '@/widgets/WidgetFactory';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'

interface CanvasProps {
  canvasWidth: number;
  widgetsStructure: any
}

export default function Canvas(props: CanvasProps) {
  const { canvasWidth, widgetsStructure } = props;


  return (
    <>
      <div
        className='canvas'
        style={
          {
          position: 'relative',
          width: `${canvasWidth}px`,
          height: '100%',
        }
      }>
        {
          widgetsStructure.widgetId &&
          WidgetFactory.createWidget(
            widgetsStructure,
            "CANVAS"
          )
        }
      </div>
    </>
  )
}