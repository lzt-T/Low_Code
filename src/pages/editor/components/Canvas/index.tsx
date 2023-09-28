import { useAppSelector } from '@/hooks/redux';
import { getWidgetByIdSelector, getWidgetsSelector } from '@/store/slices/canvasWidgets';
import { isResizingSelector } from '@/store/slices/dragResize';
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
      <div style={
        {
          // backgroundColor: '#F8FAFC',
          backgroundColor: 'yellow',
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