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
import { addRowNumSelector } from '@/store/slices/dragResize'
import { MAIN_CONTAINER_WIDGET_ID } from "@/constant/canvas";


interface DropTargetComponentProps {
  children?: ReactNode;
  snapColumnSpace: number;
  snapRowSpace: number;
  widgetId: string;
  parentId?: string;
  topRow: number;
  bottomRow: number;
  leftColumn: number;
  rightColumn: number;
  parentRowSpace: number;
  parentColumnSpace: number;
  [propName: string]: any
};

export function DropTargetComponent(props: DropTargetComponentProps) {

  const { children, snapColumnSpace = 0, snapRowSpace = 0,
    widgetId, parentId, topRow, bottomRow, parentRowSpace
  } = props
  const { isShowDragLayer } = useIsShowDragLayer(widgetId)
  const isDragging = useAppSelector(isDraggingSelector)
  const childWidgets = useAppSelector(getWidgetChildrenSelector(widgetId))
  const addRowNum = useAppSelector(addRowNumSelector(widgetId))
  let height = useMemo(() => {
    return (bottomRow - topRow + addRowNum * 10) * parentRowSpace
  }, [topRow, bottomRow, parentRowSpace, addRowNum, widgetId])

  /** 是否为空*/
  const isEmpty = useMemo(() => {
    if (!childWidgets.length && !isDragging && !parentId) {
      return true
    }
    return false
  }, [isDragging, childWidgets, parentId])


  return (
    <div
      className="gridLine"
      style={{
        width: "100%",
        height: widgetId === MAIN_CONTAINER_WIDGET_ID ? `${height}px` : "100%",
        position: "relative",
        background: "none",
        userSelect: "none",
        zIndex: "1",
      }}
    >
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
