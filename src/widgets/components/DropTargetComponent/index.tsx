import { useAppSelector } from "@/hooks/redux";
import { getWidgetChildrenSelector } from "@/store/slices/canvasWidgets";
import { isDraggingSelector } from "@/store/slices/dragResize";
import React, {
  ReactNode,
  memo,
  useMemo,
} from "react"
import DragLayerComponent from "../DragLayerComponent";
import useIsShowDragLayer from "@/hooks/useIsShowDragLayer";


interface DropTargetComponentProps {
  children?: ReactNode;
  snapColumnSpace: number;
  snapRowSpace: number;
  widgetId: string;
  parentId?: string;
  [propName: string]: any
};

export function DropTargetComponent(props: DropTargetComponentProps) {

  const { children, snapColumnSpace = 0, snapRowSpace = 0, widgetId, parentId } = props
  const { isShowDragLayer } = useIsShowDragLayer(widgetId)
  const isDragging = useAppSelector(isDraggingSelector)
  const childWidgets = useAppSelector(getWidgetChildrenSelector(widgetId))
  /** 是否为空*/
  const isEmpty = useMemo(() => {
    if (!childWidgets.length && !isDragging && !parentId) {
      return true
    }
    return false
  }, [isDragging, childWidgets, parentId])


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
        isShowDragLayer && (
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
