import { isResizingSelector, selectWidget, setWidgetResizing } from "@/store/slices/dragResize"
import { useCallback, useContext, useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { useAppSelector } from "./redux"

interface UseResizeProps {
  widgetId: string;
  [propsName: string]: any
}

/**
* @description resize操作
* @param 
* @returns
*/
export const useResize = (props: UseResizeProps) => {

  const { widgetId } = props

  const dispatch = useDispatch()
  const isResizing = useAppSelector(isResizingSelector)

  /** 开始resize*/
  const onResizeStart = useCallback(() => {
    !isResizing && dispatch(setWidgetResizing({ isResizing: true }))
    selectWidget(widgetId)
  }, [isResizing, widgetId])

  /** 停止resize*/
  const onResizeStop = useCallback(() => {
    dispatch(setWidgetResizing({ isResizing: false }))
  }, [])



  return {
    onResizeStart,
    onResizeStop
  }
}
