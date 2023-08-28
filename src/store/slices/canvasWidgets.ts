//画布中widget的值
import { CANVAS_DEFAULT_MIN_ROWS, MAIN_CONTAINER_WIDGET_ID, RenderModes } from "@/constant/canvas"
import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from ".."


const initialState: any = {
  0: {
    type: "CANVAS_WIDGET",
    widgetId: MAIN_CONTAINER_WIDGET_ID,
    topRow: 0,
    bottomRow: CANVAS_DEFAULT_MIN_ROWS,
    renderMode: RenderModes.CANVAS,
    canExtend: true,
    widgetName: "MainContainer",
    detachFromLayout: true,
    parentColumnSpace: 1,
    parentRowSpace: 1,
    leftColumn: 0,
    rightColumn: 450,
    version: 1,
    isLoading: false,
    children: ['temp_button_widget_id'],
    snapColumns: 64,
    noPad: true,
  },
  'temp_button_widget_id': {
    widgetId: 'temp_button_widget_id',
    leftColumn: 2,
    rightColumn: 20,
    topRow: 4,
    bottomRow: 10,
    parentId: '0',
    type: 'BUTTON_WIDGET',
    widgetName: 'Button Widget',
    renderMode: "CANVAS",
    isDisabled: false,
    version: 1,
    isLoading: false,
    text: '按钮文字',
    parentColumnSpace: 10,
    parentRowSpace: 10,
    detachFromLayout: false,
    isVisible: false,
  },
}

const canvasWidgetsSlice = createSlice({
  name: 'canvasWidgets',
  initialState,
  reducers: {
    /** 初始化画布内的widgets*/
    initLayout: (
      state,
      action: any
    ) => {
      state = action.payload.widgets
      // return action.payload.widgets
    },
  }
})

export const {
  initLayout
} = canvasWidgetsSlice.actions

/** 获取所有widgets对象数据*/
export const getWidgetsSelector = (state: RootState) => state.canvasWidgets

/**
 * 获取特定widget
 * @param widgetId
 */
export const getWidgetByIdSelector = (widgetId: string) => {
  return createSelector(
    getWidgetsSelector,
    (canvasWidgets: any) => {
      return canvasWidgets[widgetId]
    }
  )
}

export default canvasWidgetsSlice.reducer