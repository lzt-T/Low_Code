import { isResizingSelector, selectWidget, setWidgetResizing } from "@/store/slices/dragResize"
import { useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useDispatch } from "react-redux"
import { useAppSelector } from "./redux"
import { ReflowDirection } from "@/enum/move";
import { getReflowByIdSelector } from "@/store/slices/widgetReflowSlice";
import { WIDGET_PADDING } from "@/constant/widget";

interface UseResizeProps {
  widgetId: string;
  componentWidth: number;
  componentHeight: number;
  [propsName: string]: any
}

const equal = (
  reflowA: any,
  reflowB: any,
) => {
  return !(reflowA?.width !== reflowB?.width ||
    reflowA?.height !== reflowB?.height)
}

export interface DimensionProps {
  /** 宽度*/
  width: number;
  /** 高度*/
  height: number;
  /** x的移动距离*/
  x: number;
  /** Y的移动距离*/
  y: number;
  reset?: boolean;
  direction: ReflowDirection;
  [propName:string]:any
}

/**
* @description resize操作
* @param 
* @returns
*/
export const useResize = (props: UseResizeProps) => {
  const { widgetId, componentWidth, componentHeight } = props
  const [newDimensions, setNewDimensions] = useState<DimensionProps>({
    width: componentWidth, // 组件宽度
    height: componentHeight, // 组件高度
    x: 0, // 坐标点变化
    y: 0, // 坐标点变化
    reset: false,
    direction: ReflowDirection.UNSET
  })

  const dispatch = useDispatch()
  const isResizing = useAppSelector(isResizingSelector)
  /** 在reflow中的样式*/
  const reflowedPosition: any = useAppSelector(getReflowByIdSelector(widgetId), equal);

  /** 开始resize*/
  const onResizeStart = useCallback(() => {
    !isResizing && dispatch(setWidgetResizing({ isResizing: true }))
    selectWidget(widgetId)
  }, [isResizing, widgetId])

  // resize过程
  const onResizeDrag = useCallback((rect:DimensionProps) => {
    const { x, y, width, height, direction } = rect
    setNewDimensions({
      x, y, width, height, direction 
    })
    // console.log(componentWidth, componentHeight);
  }, [])


  /** 停止resize*/
  const onResizeStop = useCallback(() => {
    dispatch(setWidgetResizing({ isResizing: false }))
  }, [])

  /** 拖拽时widget宽度*/
  const widgetWidth = useMemo(() => {
    if (reflowedPosition?.width) {
      return reflowedPosition.width - 2 * WIDGET_PADDING
    }
    return newDimensions.width
  }, [reflowedPosition, newDimensions])

  /** 拖拽时widget高度*/
  const widgetHeight = useMemo(() => {
    if (reflowedPosition?.height) {
      return reflowedPosition.height - 2 * WIDGET_PADDING
    }
    return newDimensions.height
  }, [reflowedPosition, newDimensions])


  return {
    widgetDimension: newDimensions,
    widgetWidth,
    widgetHeight,
    onResizeStart,
    onResizeStop,
    onResizeDrag
  }
}
