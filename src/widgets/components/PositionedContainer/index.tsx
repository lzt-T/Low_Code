import { WIDGET_PADDING } from '@/constant/widget';
import { useAppSelector } from '@/hooks/redux';
import { dragDetailsSelector, isResizingSelector } from '@/store/slices/dragResize';
import { getReflowByIdSelector, getReflowSelector } from '@/store/slices/widgetReflowSlice';
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
  widgetType: string,
  [propsName: string]: any
}
export default function PositionedContainer(props: PositionedContainer) {
  const { children, widgetId, topRow, parentRowSpace, leftColumn, parentColumnSpace,
    componentHeight, componentWidth, parentId
  } = props;

  /** 在reflow中的样式*/
  const reflowedPosition = useAppSelector(getReflowByIdSelector(widgetId), equal)
  const dragDetails = useAppSelector(dragDetailsSelector)

  const top = useMemo(() => {
    return topRow * parentRowSpace
  }, [topRow, parentRowSpace, widgetId])

  const left = useMemo(() => {
    return leftColumn * parentColumnSpace
  }, [leftColumn, parentColumnSpace])


  /** reflow时的样式*/
  const reflowedPositionStyles: React.CSSProperties = useMemo(() => {
    const reflowX = reflowedPosition?.X || 0;
    const reflowY = reflowedPosition?.Y || 0;

    if (reflowedPosition) {
      /** 当dragDetails.draggedOn存在时,不是当前画布的儿子，不移动*/
      if (!!dragDetails.draggedOn && dragDetails.draggedOn != parentId) {
        return {}
      }

      return {
        transform: `translate(${reflowX}px,${reflowY}px)`,
        transition: `transform 100ms linear`,
        boxShadow: `0 0 0 1px rgba(104,113,239,0.5)`,
      }
    } else {
      return {}
    }
  }, [reflowedPosition, dragDetails, parentId])


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