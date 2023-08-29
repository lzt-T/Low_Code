import { MAIN_CONTAINER_WIDGET_ID } from "@/constant/canvas";
import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "..";

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
      // if (action.payload === MAIN_CONTAINER_WIDGET_ID) {
      //   state.curFocusedWidgetId = '';
      // } else {
      //   state.curFocusedWidgetId = action.payload
      // }
      state.curFocusedWidgetId = 'temp_button_widget_id'
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
      action: {payload:string},
    ) => {
      state.selectedWidgets = [action.payload]

    },
    selectWidgets: (state, action: PayloadAction<{ widgetIds?: string[] }>) => {
      // const { widgetIds } = action.payload
      // if (widgetIds && !areArraysEqual(widgetIds, state.selectedWidgets)) {
      //   state.selectedWidgets = [...state.selectedWidgets, ...widgetIds]
      // }
    },


    /**
     * @description 开始调整元素大小
     * @param state
     * @param action
     */
    setWidgetResizing: (
      state,
      action: PayloadAction<{
        isResizing: boolean,
      }>
    ) => {
      state.isResizing = action.payload.isResizing
    },
  },
})


export const {
  focusWidget,
  setWidgetResizing,
  selectWidget
} = dragResizeSlice.actions

export const isDraggingSelector = (state: RootState) => {
  return state.ui.dragResize.isDragging
}
export const isResizingSelector = (state: RootState) => {
  return state.ui.dragResize.isResizing
}
export const dragDetailsSelector = (state: RootState) => {
  return state.ui.dragResize.dragDetails
}

export default dragResizeSlice.reducer