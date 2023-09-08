import { useAppSelector } from "@/hooks/redux";
import { getWidgetChildrenSelector } from "@/store/slices/canvasWidgets";
import { dragDetailsSelector, isDraggingSelector, isResizingSelector } from "@/store/slices/dragResize";
import React, {
  ReactNode,
  memo,
  useMemo,
} from "react"
import DragLayerComponent from "../DragLayerComponent";


interface DropTargetComponentProps {
  children?: ReactNode;
  snapColumnSpace: number;
  snapRowSpace: number;
  [propName: string]: any
};

export function DropTargetComponent(props: DropTargetComponentProps) {

  const { children, snapColumnSpace = 0, snapRowSpace = 0 } = props
  const isResizing = useAppSelector(isResizingSelector)
  const isDragging = useAppSelector(isDraggingSelector)
  const dragDetails = useAppSelector(dragDetailsSelector)

  /** 在哪里拖拽*/
  const draggedOn = useMemo(() => {
    return dragDetails.draggedOn
  }, [dragDetails])
  const childWidgets = useAppSelector(getWidgetChildrenSelector(props.widgetId))

  /** 是否为空*/
  const isEmpty = useMemo(() => {
    if (!childWidgets.length && !isDragging && !props.parentId) {
      return true
    }
    return false
  }, [isDragging, childWidgets, props])

  /** 是否展示网格线*/
  const showDragLayer = useMemo(() => {
    return (isDragging && draggedOn === props.widgetId) || isResizing
  }, [isDragging, draggedOn, props, isResizing])

  return (
    <div style={{
      width: "100%",
      height: "100%",
      position: "relative",
      background: "none",
      userSelect: "none",
      zIndex: "1",
    }
    }>
      {isEmpty && <div>请拖拽组件</div>}
      {
        showDragLayer &&
        (
          <DragLayerComponent
            parentColumnWidth={snapColumnSpace}
            parentRowHeight={snapRowSpace}
          />
        )
      }
      {children}
    </div>
  )
}

const MemoizedDropTargetComponent = memo(DropTargetComponent)

export default MemoizedDropTargetComponent
