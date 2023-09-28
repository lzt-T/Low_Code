import { useAppSelector } from '@/hooks/redux'
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { isCurrentWidgetFocused } from '@/selectors/widgetSelectors'
import { isDraggingSelector, isResizingSelector } from '@/store/slices/dragResize'
import { PositionSty } from './style'



type widgetNameProps = {
  widgetName: string,
  widgetId: string
}
export default function WidgetNameComponent(props: widgetNameProps) {
  const { widgetName, widgetId } = props
  const isFocused = useAppSelector(isCurrentWidgetFocused(widgetId))
  const isDragging = useAppSelector(isDraggingSelector)
  const isResizing = useAppSelector(isResizingSelector)

  /** 是否展示widgetName*/
  const isShowWidgetName = useMemo(() => {
    return isFocused && !isDragging && !isResizing
  }, [isFocused, isDragging, isResizing])

  return (
    <>
      {
        isShowWidgetName ? <PositionSty>
          {widgetName}
        </PositionSty> : null
      }
    </>
  )
}