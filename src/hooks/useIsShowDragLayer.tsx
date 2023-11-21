import { curFocusedWidgetIdSelector, dragDetailsSelector, isDraggingSelector, isResizingSelector } from "@/store/slices/dragResize"
import { useAppSelector } from "./redux"
import { useMemo } from "react"
import { getWidgetByIdSelector } from "@/store/slices/canvasWidgets"



export default function useIsShowDragLayer(canvasId: string) {
  const isResizing = useAppSelector(isResizingSelector)
  const isDragging = useAppSelector(isDraggingSelector)
  const dragDetails = useAppSelector(dragDetailsSelector)
  const focusedWidget = useAppSelector(curFocusedWidgetIdSelector) || '0';
  const focusedWidgetInfo = useAppSelector(getWidgetByIdSelector(focusedWidget))

  /** 当前在哪个画布上拖拽*/
  const draggedOn = useMemo(() => {
    return dragDetails.draggedOn
  }, [dragDetails])

  /** 是否展示网格线*/
  const isShowDragLayer = useMemo(() => {
    if (isDragging && draggedOn === canvasId || isResizing && focusedWidgetInfo.parentId === canvasId) {
      return true
    }
    return false
  }, [isDragging, draggedOn, canvasId, isResizing, focusedWidgetInfo])

  return {
    isShowDragLayer
  }
}