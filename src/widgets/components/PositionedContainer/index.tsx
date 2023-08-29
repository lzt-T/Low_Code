import { WIDGET_PADDING } from '@/constant/widget';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'

interface PositionedContainer {
  /** 宽*/
  componentWidth: number;
  /** 高*/
  componentHeight: number;
  children: React.ReactNode;
  parentId?: string;
  widgetId: string;
  /** 高度格数*/
  topRow: number,
  /** 单位长度*/
  parentRowSpace: number,
  parentColumnSpace: number,
  leftColumn: number,
  [propsName: string]: any
}
export default function PositionedContainer(props: PositionedContainer) {
  const { children, widgetId, topRow, parentRowSpace, leftColumn, parentColumnSpace,
    componentHeight, componentWidth
  } = props;


  const top = useMemo(() => {
    return topRow * parentRowSpace
  }, [topRow, parentRowSpace])

  const left = useMemo(() => {
    return leftColumn * parentColumnSpace
  }, [leftColumn, parentColumnSpace])


  const containerStyle: React.CSSProperties = useMemo(() => {
    let style: React.CSSProperties = {
      position: 'absolute',
      top,
      left,
      height: componentHeight,
      width: componentWidth,
      /** 添加padding*/
      padding: `${WIDGET_PADDING}px`,
      boxSizing: 'border-box',
    }
    return style

  }, [top, left, componentHeight, componentWidth])

  return (
    <>
      <div
        style={containerStyle}
      >
        {children}
      </div>
    </>
  )
}