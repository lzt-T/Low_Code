import { WIDGET_PADDING } from '@/constant/widget';
import { useAppSelector } from '@/hooks/redux';
import { getReflowByIdSelector } from '@/store/slices/widgetReflowSlice';
import equal from "fast-deep-equal"
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

  /** 在reflow中的样式*/
  const reflowedPosition = useAppSelector(getReflowByIdSelector(widgetId), equal)

  const top = useMemo(() => {
    return topRow * parentRowSpace
  }, [topRow, parentRowSpace,widgetId])

  const left = useMemo(() => {
    return leftColumn * parentColumnSpace
  }, [leftColumn, parentColumnSpace])


  /** reflow时的样式*/
  const reflowedPositionStyles: React.CSSProperties = useMemo(() => {
    const reflowX = reflowedPosition?.X || 0;
    const reflowY = reflowedPosition?.Y || 0;   

    if (reflowedPosition) {
      return {
        transform: `translate(${reflowX}px,${reflowY}px)`,
        transition: `transform 100ms linear`,
        boxShadow: `0 0 0 1px rgba(104,113,239,0.5)`,
      }
    } else {
      return {}
    }
  }, [reflowedPosition])


  const containerStyle: React.CSSProperties = useMemo(() => {
    let style: React.CSSProperties = {
      position: 'absolute',
      top,
      left,
      height: reflowedPosition?.height || componentHeight,
      width: reflowedPosition?.width || componentWidth,
      /** 添加padding*/
      padding: `${WIDGET_PADDING}px`,
      boxSizing: 'border-box',
      ...reflowedPositionStyles
    }
    return style

  }, [top, left, componentHeight, componentWidth, reflowedPosition, reflowedPositionStyles])

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