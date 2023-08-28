import { RootState } from "@/store"
import { createSelector } from "@reduxjs/toolkit"

export const getSelectedWidgets = (state: RootState) => {
  return state.ui.dragResize.selectedWidgets
}


export const isMultiSelectedWidget = (widgetId: string) => {
  return createSelector(
    getSelectedWidgets,
    (widgets): boolean => widgets.length > 1 && widgets.includes(widgetId),
  )
}


export const getFocusedWidget = (state: RootState) => {
  return state.ui.dragResize.curFocusedWidgetId
}
  
    
/** 当前的widget是否聚焦*/
export const isCurrentWidgetFocused = (widgetId: string) => {
  return createSelector(
    getFocusedWidget,
    (currFocusWidgetId): boolean => currFocusWidgetId === widgetId,
  )
}