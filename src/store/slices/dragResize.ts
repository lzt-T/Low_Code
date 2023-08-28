import { MAIN_CONTAINER_WIDGET_ID } from "@/constant/canvas";
import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit"

interface DragResizeState {
  /** 是否拖拽*/
  isDragging: boolean;
  isResizing: boolean;
  isDraggingDisabled: boolean;
  dragDetails: any,
  selectedWidgets: string[], //选择中的widget
  curFocusedWidgetId?: string; // 当前激活的部件
  lastSelectedWidget: string; // 最后选中的部件
}

const initialState: DragResizeState = {
  isDragging: false,
  isResizing: false,
  isDraggingDisabled: false,
  dragDetails: {},
  selectedWidgets: [],
  curFocusedWidgetId: undefined,
  lastSelectedWidget: "",
}


export const dragResizeSlice = createSlice({
  name: 'dragResize',
  initialState,
  reducers: {

    /** 
     * @description  激活部件,显示调整大小边框
     * @param state
     * @param action
     */
    focusWidget: (state, action: {
      payload: string
    }) => {
      if (action.payload === MAIN_CONTAINER_WIDGET_ID) {
        state.curFocusedWidgetId = '';
      } else {
        state.curFocusedWidgetId = action.payload
      }
      // state.curFocusedWidgetId = 'temp_button_widget_id'
    },

    selectMultipleWidgets: (state, action: PayloadAction<{ widgetIds: string[] }>) => {
      // const { widgetIds } = action.payload
      // if (widgetIds && !areArraysEqual(widgetIds, state.selectedWidgets)) {
      //   state.selectedWidgets = widgetIds || []
      //   if (widgetIds.length > 1) {
      //     state.lastSelectedWidget = ""
      //   } else {
      //     state.lastSelectedWidget = widgetIds[0]
      //   }
      // }
    },
    /**
     * 选中部件
     * @param state
     * @param action
     */
    selectWidget: (
      state,
      action: PayloadAction<{ widgetId?: string; isMultiSelect?: boolean }>,
    ) => {
      // if (action.payload.widgetId === MAIN_CONTAINER_WIDGET_ID) return
      // if (action.payload.isMultiSelect) {
      //   const widgetId = action.payload.widgetId || ''
      //   const removeSelection = state.selectedWidgets.includes(widgetId)
      //   if (removeSelection) {
      //     state.selectedWidgets = state.selectedWidgets.filter(
      //       (each) => each !== widgetId
      //     )
      //   } else if (!!widgetId) {
      //     state.selectedWidgets = [...state.selectedWidgets, widgetId]
      //   }
      //   if (state.selectedWidgets.length > 0) {
      //     state.lastSelectedWidget = removeSelection ? "" : widgetId
      //   }
      // } else {
      //   state.lastSelectedWidget = action.payload.widgetId || ''
      //   if (!action.payload.widgetId) {
      //     state.selectedWidgets = []
      //   } else if (!areArraysEqual(state.selectedWidgets, [action.payload.widgetId])) {
      //     state.selectedWidgets = [action.payload.widgetId]
      //   }
      // }

    },
    selectWidgets: (state, action: PayloadAction<{ widgetIds?: string[] }>) => {
      // const { widgetIds } = action.payload
      // if (widgetIds && !areArraysEqual(widgetIds, state.selectedWidgets)) {
      //   state.selectedWidgets = [...state.selectedWidgets, ...widgetIds]
      // }
    },
  },
})


export const { focusWidget } = dragResizeSlice.actions

export default dragResizeSlice.reducer