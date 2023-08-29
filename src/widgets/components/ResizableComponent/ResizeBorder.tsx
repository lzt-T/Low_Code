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

interface ResizeBorderProps {
  /** 开始调整大小*/
  onResizeStart: () => void
  /** 停止调整大小*/
  onResizeStop:()=>void
}

export default function ResizeBorder(props: ResizeBorderProps) {
  const { onResizeStart,onResizeStop } = props;

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
      })
    }
    if (allBorders.bottomBorderEle) {
      list.push({
        Component: allBorders.bottomBorderEle,
      })
    }
    if (allBorders.leftBorderEle) {
      list.push({
        Component: allBorders.leftBorderEle,
      })
    }
    if (allBorders.rightBorderEle) {
      list.push({
        Component: allBorders.rightBorderEle,
      })
    }
    if (allBorders.topLeftBorderEle) {
      list.push({
        Component: allBorders.topLeftBorderEle,
      })
    }
    if (allBorders.topRightBorderEle) {
      list.push({
        Component: allBorders.topRightBorderEle,
      })
    }
    if (allBorders.bottomLeftBorderEle) {
      list.push({
        Component: allBorders.bottomLeftBorderEle,
      })
    }
    if (allBorders.bottomRightBorderEle) {
      list.push({
        Component: allBorders.bottomRightBorderEle,
      })
    }

    setBorderList(list)
  }, [allBorders])

  return (
    <>
      {
        borderList.map((item: any, ind: number) => {
          return (
            <ResizableHandle
              Component={item.Component}
              onStart={onResizeStart}
              onStop={onResizeStop}
              key={ind}
            />
          )
        })
      }
    </>
  )
}