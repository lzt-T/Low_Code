import { MAIN_CONTAINER_WIDGET_ID } from "@/constant/canvas";
import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "..";

interface DragResizeState {
  /** 是否拖拽*/
  isDragging: boolean;
  isResizing: boolean;
  isDraggingDisabled: boolean;
  dragDetails: {
    newWidget: any;
    draggedOn: string;
  },
  selectedWidgets: string[], //选择中的widget
  curFocusedWidgetId?: string; // 当前激活的部件
  lastSelectedWidget: string; // 最后选中的部件
}

const initialState: DragResizeState = {
  isDragging: false,
  isResizing: false,
  isDraggingDisabled: false,
  dragDetails: {
    newWidget: {},
    draggedOn: '',
  },
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
      // state.curFocusedWidgetId = 'one'
    },
    /**
     * 开始拖拽新部件
     * @param state
     * @param action
     */
    setNewWidgetDragging: (
      state,
      action: PayloadAction<{
        isDragging: boolean;
        newWidgetProps?: any
      }>
    ) => {

      document.body.style.cursor = "grabbing"
      state.isDragging = action.payload.isDragging
      state.dragDetails = {
        newWidget: action.payload.newWidgetProps,
        draggedOn: MAIN_CONTAINER_WIDGET_ID,
      }
    },

    /**
    * 拖拽的目标画布
    * @param state
    * @param action
    */
    setDraggingCanvas: (
      state,
      action: PayloadAction<{ draggedOn?: string }>
    ) => {
      state.dragDetails.draggedOn = action.payload.draggedOn || '';
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
      action: { payload: string },
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
    * @description
    * @param 
    * @returns
    */
    setIsDragging: (state,action) => {
      state.isDragging = action.payload
    },

    /**
    * @description 结束拖拽
    * @param 
    * @returns
    */
    endDragging: (state) => {
      state.isDragging = false
      state.dragDetails = {
        newWidget: {},
        draggedOn: '',
      }
      document.body.style.cursor = "default"
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
  selectWidget,
  setNewWidgetDragging,
  setDraggingCanvas,
  endDragging,
  setIsDragging
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
export const curFocusedWidgetIdSelector = (state: RootState) => {
  return state.ui.dragResize.curFocusedWidgetId
}

export default dragResizeSlice.reducer