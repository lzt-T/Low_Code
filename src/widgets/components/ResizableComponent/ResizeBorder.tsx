//调整大小边框
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import {
  BottomBorderStyles,
  BottomLeftBorderStyles,
  BottomRightBorderStyles,
  LeftBorderStyles,
  RightBorderStyles,
  TopBorderStyles,
  TopLeftBorderStyles,
  TopRightBorderStyles
} from './ResizeableStyle'
import ResizableHandle from './ResizableHandle'
import { ReflowDirection } from '@/enum/move'
import { isResizingSelector } from '@/store/slices/dragResize'
import { useAppSelector } from '@/hooks/redux'

interface ResizeBorderProps {
  widgetDimension: any,
  dimensions: {
    /** 原始宽度*/
    width: number
    /** 原始高度*/
    height: number
  }
  /** 开始调整大小*/
  onResizeStart: () => void
  /** 停止调整大小*/
  onResizeStop: () => void
  /** 调整大小的过程*/
  onResizeDrag: (rect: any) => void,
  scrollParent: any,
  [propName: string]: any
}

export default function ResizeBorder(props: ResizeBorderProps) {
  const {
    onResizeStart, onResizeStop, onResizeDrag,
    parentRowSpace, parentColumnSpace, scrollParent,
    dimensions, widgetDimension
  } = props;

  /** 是否处于调整大小状态*/
  const isResizing = useAppSelector(isResizingSelector)
  const [borderList, setBorderList] = useState([])

  let lastMouseMove = useRef({
    x: 0,
    y: 0,
    scrollY: 0,
    direction: ReflowDirection.UNSET,
    /** 中断的Y值*/
    breakY: 0,
  })

  let lastMouseScroll = useRef({
    x: 0,
    y: 0,
    /** 中断的Y值*/
    breakY: 0,
  })

  const allBorders: Record<string, any> = useMemo(() => {
    return {
      leftBorderEle: LeftBorderStyles,
      topBorderEle: TopBorderStyles,
      bottomBorderEle: BottomBorderStyles,
      rightBorderEle: RightBorderStyles,
      topLeftBorderEle: TopLeftBorderStyles,
      topRightBorderEle: TopRightBorderStyles,
      bottomLeftBorderEle: BottomLeftBorderStyles,
      bottomRightBorderEle: BottomRightBorderStyles,
    }
  }, [])

  /** 停止调整大小*/
  const onResizeStopFn = useCallback(() => {
    onResizeStop()
    lastMouseMove.current = {
      x: 0,
      y: 0,
      scrollY: 0,
      direction: ReflowDirection.UNSET,
      breakY: 0,
    }
    lastMouseScroll.current = {
      x: 0,
      y: 0,
      breakY: 0,
    }
  }, [onResizeStop])


  const onResizeDragFn = useCallback((x: number, y: number, direction: ReflowDirection) => {
    onResizeDrag({
      x,
      y: lastMouseScroll.current.y + (y - lastMouseScroll.current.breakY),
      direction,
    })
    lastMouseMove.current = {
      x,
      y: lastMouseScroll.current.y + (y - lastMouseScroll.current.breakY),
      scrollY: scrollParent.scrollTop,
      direction,
      breakY: y,
    }
  }, [scrollParent, onResizeDrag])


  /** 设置边框dom*/
  useEffect(() => {
    let list: any = [];
    if (allBorders.topBorderEle) {
      list.push({
        Component: allBorders.topBorderEle,
        onDrag: (x: number, y: number) => {
          onResizeDragFn(x, y, ReflowDirection.TOP)
        }
      })
    }
    if (allBorders.bottomBorderEle) {
      list.push({
        Component: allBorders.bottomBorderEle,
        onDrag: (x: number, y: number) => {
          onResizeDragFn(x, y, ReflowDirection.BOTTOM)
        }
      })
    }
    if (allBorders.leftBorderEle) {
      list.push({
        Component: allBorders.leftBorderEle,
        onDrag: (x: number, y: number) => {
          onResizeDragFn(x, y, ReflowDirection.LEFT)
        }
      })
    }
    if (allBorders.rightBorderEle) {
      list.push({
        Component: allBorders.rightBorderEle,
        onDrag: (x: number, y: number) => {
          onResizeDragFn(x, y, ReflowDirection.RIGHT)
        }
      })
    }
    if (allBorders.topLeftBorderEle) {
      list.push({
        Component: allBorders.topLeftBorderEle,
        onDrag: (x: number, y: number) => {
          onResizeDragFn(x, y, ReflowDirection.TOPLEFT)
        }
      })
    }
    if (allBorders.topRightBorderEle) {
      list.push({
        Component: allBorders.topRightBorderEle,
        onDrag: (x: number, y: number) => {
          onResizeDragFn(x, y, ReflowDirection.TOPRIGHT)
        }
      })
    }
    if (allBorders.bottomLeftBorderEle) {
      list.push({
        Component: allBorders.bottomLeftBorderEle,
        onDrag: (x: number, y: number) => {
          onResizeDragFn(x, y, ReflowDirection.BOTTOMLEFT)
        }
      })
    }
    if (allBorders.bottomRightBorderEle) {
      list.push({
        Component: allBorders.bottomRightBorderEle,
        onDrag: (x: number, y: number) => {
          onResizeDragFn(x, y, ReflowDirection.BOTTOMRIGHT)
        }
      })
    }
    setBorderList(list)
  }, [allBorders, dimensions, scrollParent, onResizeDragFn])


  useEffect(() => {
    const onScroll = (e: Event) => {
      if (!isResizing) {
        return
      }

      /** 滚动差值*/
      let scrollDistance = Math.round((scrollParent.scrollTop - lastMouseMove.current.scrollY) / parentRowSpace) * parentRowSpace;
      onResizeDrag({
        x: lastMouseMove.current.x,
        y: lastMouseMove.current.y + scrollDistance,
        direction: lastMouseMove.current.direction,
      })
      lastMouseScroll.current = {
        x: lastMouseMove.current.x,
        y: lastMouseMove.current.y + scrollDistance,
        breakY: lastMouseMove.current.breakY,
      }
    }

    scrollParent.addEventListener('scroll', onScroll)
    return () => {
      scrollParent.removeEventListener('scroll', onScroll)
    }
  }, [isResizing, scrollParent, onResizeDrag])

  return (
    <>
      {
        borderList.map((item: any, ind: number) => {
          return (
            <ResizableHandle
              Component={item.Component}
              onDrag={item.onDrag}
              onStart={onResizeStart}
              onStop={onResizeStopFn}
              key={ind}
              scrollParent={scrollParent}
              snapGrid={{
                rowSpace: parentRowSpace,
                columnSpace: parentColumnSpace,
              }}
            />
          )
        })
      }
    </>
  )
}