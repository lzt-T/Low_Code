import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useDrag } from "@use-gesture/react"

interface ResizableHandleProps {
  Component: any,
  onStart: () => void,
  onStop: () => void,
  /** x、y表示移动的距离*/
  onDrag: (x: number, y: number) => void,
  snapGrid: {
    rowSpace: number,
    columnSpace: number,
  },
  scrollParent: any
}


/** 获取当前位置所在单元格的坐标信息*/
const getSnappedValues = (
  x: number,
  y: number,
  snapGrid: { rowSpace: number; columnSpace: number },
) => {
  return {
    x: Math.round(x / snapGrid.columnSpace) * snapGrid.columnSpace,
    y: Math.round(y / snapGrid.rowSpace) * snapGrid.rowSpace,
  }
}


export default function ResizableHandle(props: ResizableHandleProps) {
  const {
    Component,
    onStart = () => { },
    onStop = () => { },
    onDrag = () => { },
    snapGrid,
    scrollParent
  } = props


  const bind = useDrag((state: any) => {
    const {
      first,
      last,
      dragging,
      //记录数据,就是return出去的数据
      memo,
      //mx表示在轴上移动的距离，my表示在y轴上移动的距离
      movement: [mx, my],
    } = state

    const snapped = getSnappedValues(mx, my, snapGrid)
    if (first) {
      onStart()
    }

    if (dragging) {
      onDrag(snapped.x, snapped.y)
    }

    if (last) {
      onStop()
    }
  })
  return (
    <>
      <Component {...bind()} ></Component>
    </>
  )
}