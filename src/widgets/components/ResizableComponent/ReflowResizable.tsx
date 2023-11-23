import React, { useCallback, useEffect, useMemo, useRef } from "react"
import { animated, useSpring } from 'react-spring'
import ResizeBorder from "./ResizeBorder"
import { WIDGET_PADDING } from "@/constant/widget"
import { useResize } from "@/hooks/useResize"
import { getNearestParentCanvas } from "@/utils/helpers"
import { addRowInfoSelector } from "@/store/slices/dragResize"
import { useAppSelector } from "@/hooks/redux"

interface ReflowResizableProps {
  parentId?: string;
  topRow: number,
  bottomRow: number
  leftColumn: number,
  rightColumn: number,
  parentColumnSpace: number,
  parentRowSpace: number,
  enableResize: boolean,
  children: React.ReactNode,
  [propName: string]: any
}
export default function ReflowResizable(props: ReflowResizableProps) {
  const { enableResize, children, topRow, bottomRow, leftColumn,
    rightColumn, parentColumnSpace, parentRowSpace, widgetId, parentId } = props
  const resizableRef = useRef<any>(null)
  const scrollParent: Element | null = getNearestParentCanvas(resizableRef.current)

  /** 原始widget大小*/
  const dimensions: any = useMemo(() => {
    let width = (rightColumn - leftColumn) * parentColumnSpace - 2 * WIDGET_PADDING;
    if (width <= 0) {
      width = 0;
    }
    let height = (bottomRow - topRow) * parentRowSpace - 2 * WIDGET_PADDING;
    if (height <= 0) {
      height = 0;
    }
    return {
      width,
      height
    }
  }, [topRow, bottomRow, leftColumn, rightColumn, parentColumnSpace, parentRowSpace])

  const {
    widgetWidth,
    widgetHeight,
    widgetDimension,
    onResizeStart,
    onResizeStop,
    onResizeDrag,
  } = useResize({
    leftColumn,
    rightColumn,
    topRow,
    bottomRow,
    parentId,
    widgetId,
    componentWidth: dimensions.width,
    componentHeight: dimensions.height,
    parentColumnSpace: parentColumnSpace,
    parentRowSpace: parentRowSpace,
    scrollParent,
  })


  //拖动调整大小
  const styles = useSpring({
    // 弹簧的基本属性(影响动画的速度、轨迹等)
    config: { clamp: true, friction: 0, tension: 999, },
    from: {
      width: dimensions.width,
      height: dimensions.height
    },
    to: {
      width: widgetWidth,
      height: widgetHeight,
      transform: `translate3d(${widgetDimension.x}px, ${widgetDimension.y}px, 0)`
    },
    // 如果为真，则停止动画(直接跳转到结束状态)
    immediate: !!widgetDimension.reset,
  })

  return (
    <animated.div className='resize' style={{
      ...styles,
      position: 'relative',
    }} ref={resizableRef}
    >
      {children}
      {enableResize
        &&
        <ResizeBorder
          {...props}
          widgetDimension={widgetDimension}
          dimensions={dimensions}
          onResizeStart={onResizeStart}
          onResizeStop={onResizeStop}
          onResizeDrag={onResizeDrag}
          scrollParent={scrollParent}
        />
      }
    </animated.div>
  )
}
