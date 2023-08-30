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
import { DimensionProps } from '@/hooks/useResize'
import { ReflowDirection } from '@/enum/move'

interface ResizeBorderProps {
  widgetDimension: any,
  dimensions: {
    /** 原始宽度*/
    width: number
     /** 原始高度*/
    height:number
  }
  /** 开始调整大小*/
  onResizeStart: () => void
  /** 停止调整大小*/
  onResizeStop: () => void
  /** 调整大小的过程*/
  onResizeDrag: (rect:DimensionProps) => void,
  scrollParent: any,
  [propName: string]: any
}

export default function ResizeBorder(props: ResizeBorderProps) {
  const {
    onResizeStart, onResizeStop, onResizeDrag,
    parentRowSpace, parentColumnSpace, scrollParent,
    dimensions,widgetDimension
  } = props;

  const [borderList, setBorderList] = useState([])
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

  /** 设置边框dom*/
  useEffect(() => {
    let list: any = [];
    if (allBorders.topBorderEle) {
      list.push({
        Component: allBorders.topBorderEle,
        onDrag: (x: number, y: number) => {
          let height = dimensions.height - y > 0 ? dimensions.height - y : 0;
          let _y = y >= dimensions.height ? dimensions.height : y;
          onResizeDrag({
            width: dimensions.width,
            height,
            x: 0,
            y: _y,
            direction: ReflowDirection.TOP,
          })
        }
      })
    }
    if (allBorders.bottomBorderEle) {
      list.push({
        Component: allBorders.bottomBorderEle,
        onDrag: (x: number, y: number) => {
          onResizeDrag()
        }
      })
    }
    if (allBorders.leftBorderEle) {
      list.push({
        Component: allBorders.leftBorderEle,
        onDrag: (x: number, y: number) => {
          onResizeDrag()
        }
      })
    }
    if (allBorders.rightBorderEle) {
      list.push({
        Component: allBorders.rightBorderEle,
        onDrag: (x: number, y: number) => {
          onResizeDrag()
        }
      })
    }
    if (allBorders.topLeftBorderEle) {
      list.push({
        Component: allBorders.topLeftBorderEle,
        onDrag: (x: number, y: number) => {
          onResizeDrag()
        }
      })
    }
    if (allBorders.topRightBorderEle) {
      list.push({
        Component: allBorders.topRightBorderEle,
        onDrag: (x: number, y: number) => {
          onResizeDrag()
        }
      })
    }
    if (allBorders.bottomLeftBorderEle) {
      list.push({
        Component: allBorders.bottomLeftBorderEle,
        onDrag: (x: number, y: number) => {
          onResizeDrag()
        }
      })
    }
    if (allBorders.bottomRightBorderEle) {
      list.push({
        Component: allBorders.bottomRightBorderEle,
        onDrag: (x: number, y: number) => {
          onResizeDrag()
        }
      })
    }

    setBorderList(list)
  }, [allBorders,dimensions])

  return (
    <>
      {
        borderList.map((item: any, ind: number) => {
          return (
            <ResizableHandle
              Component={item.Component}
              onDrag={item.onDrag}
              onStart={onResizeStart}
              onStop={onResizeStop}
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