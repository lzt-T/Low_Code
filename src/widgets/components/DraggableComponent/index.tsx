import { WIDGET_PADDING } from '@/constant/widget'
import { useAppSelector } from '@/hooks/redux'
import { focusWidget, isDraggingSelector } from '@/store/slices/dragResize'
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useDispatch } from 'react-redux'


interface DraggableComponentProps {
  [propName: string]: any
}
export default function DraggableComponent(props: DraggableComponentProps) {
  let dispatch = useDispatch()
  const isDragging = useAppSelector(isDraggingSelector)

  /** 鼠标滑过，聚焦组件*/
  const onMouseOver = useCallback((event: any) => {
    event.stopPropagation()
    if (!props.resizeDisabled && !isDragging) {
      dispatch(focusWidget(props.widgetId))
    }
  }, [props, isDragging])

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
      }}
      onMouseOver={onMouseOver}
    >
      {props.children}
    </div>
  )
}