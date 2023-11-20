import { MAIN_CONTAINER_WIDGET_ID } from '@/constant/canvas'
import { WIDGET_PADDING } from '@/constant/widget'
import { useAppSelector } from '@/hooks/redux'
import { draggingExistingWidget, focusWidget, isDraggingSelector, isResizingSelector } from '@/store/slices/dragResize'
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useDispatch } from 'react-redux'

interface DraggableComponentProps {
  type: string;
  widgetId: string;
  /** 是否禁止可以调整大小*/
  resizeDisabled?: boolean;
  parentId?: string;
  topRow: number;
  bottomRow: number;
  leftColumn: number;
  rightColumn: number;
  parentRowSpace: number;
  parentColumnSpace: number;
  [propName: string]: any
}
export default function DraggableComponent(props: DraggableComponentProps) {
  const { type, widgetId, resizeDisabled, parentId, leftColumn, rightColumn,
    parentColumnSpace, topRow, bottomRow, parentRowSpace } = props
  let dispatch = useDispatch()
  const isDragging = useAppSelector(isDraggingSelector)
  const isResizing = useAppSelector(isResizingSelector)

  /**  是否可以拖拽*/
  const isCanDragging = useMemo(() => {
    if (isResizing || isDragging) {
      return false
    }
    return true
  }, [isResizing])

  /** 鼠标滑过，聚焦组件*/
  const onMouseOver = useCallback((event: any) => {
    if (widgetId === MAIN_CONTAINER_WIDGET_ID) {
      return
    }
    event.stopPropagation()
    if (!resizeDisabled && !isDragging) {
      dispatch(focusWidget(widgetId))
    }
  }, [widgetId, isDragging, resizeDisabled])

  /** 拖拽现有的元素*/
  const dragExistWidgetStart = useCallback((event: any) => {
    event.stopPropagation()
    if (!isCanDragging || widgetId === MAIN_CONTAINER_WIDGET_ID || !parentId) {
      return
    }
    //widget的宽度
    const widgetWidth = (rightColumn - leftColumn) * parentColumnSpace;
    const widgetHeight = (bottomRow - topRow) * parentRowSpace;

    //鼠标在元素内的比例
    const mouseXInEleProportion = (event.nativeEvent.offsetX + WIDGET_PADDING) / widgetWidth;
    const mouseYInEleProportion = (event.nativeEvent.offsetY + WIDGET_PADDING) / widgetHeight;
    dispatch(draggingExistingWidget({
      canvasId: parentId,
      widgetId,
      existingWidget: {
        mouseXInEleProportion,
        mouseYInEleProportion,
      }
    }))
  }, [isCanDragging, widgetId, parentId, rightColumn, leftColumn, parentColumnSpace, bottomRow, topRow])

  return (
    <div
      className='dragging'
      style={{
        width: '100%',
        height: '100%',
      }}
      onMouseDown={dragExistWidgetStart}
      onMouseOver={onMouseOver}
    >
      {props.children}
    </div>
  )
}