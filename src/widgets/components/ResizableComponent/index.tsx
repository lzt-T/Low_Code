import { useAppSelector } from '@/hooks/redux'
import { isCurrentWidgetFocused } from '@/selectors/widgetSelectors'
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import ReflowResizable from './ReflowResizable'

interface ResizableComponentProps {
  topRow: number,
  bottomRow: number
  leftColumn: number,
  rightColumn: number,
  parentColumnSpace: number,
  parentRowSpace: number,
  [propName: string]: any
}

/** 调整大小*/
export default function ResizableComponent(props: ResizableComponentProps) {
  const isFocused = useAppSelector(isCurrentWidgetFocused(props.widgetId))
  
  /** 是否可以调整大小*/
  const isEnableResize = useMemo(() => {
    if (isFocused && !props.resizeDisabled) {
      return true
    }
    return false
  }, [props,isFocused])


  return (
    <ReflowResizable
      {...props}
      enableResize={isEnableResize}
    >
      {props.children}
    </ReflowResizable>
  )
}