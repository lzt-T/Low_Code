import { MAIN_CONTAINER_WIDGET_ID } from "@/constant/canvas";
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "..";
import { DraggingStatus, DraggingType } from "@/enum/move";
import { DirectionAttributes } from "@/interface/space";

interface DragResizeState {
  /** 是否拖拽*/
  isDragging: boolean;
  isResizing: boolean;
  isDraggingDisabled: boolean;
  dragDetails: {
    draggingType: DraggingType
    newWidget: any;
    /** 当前画布*/
    draggedOn: string;
    /** 上一次的画布id*/
    lastDraggedOn: string;
    existingWidget: {
      mouseXInEleProportion: number,
      mouseYInEleProportion: number,
    }
  },
  /** 拖拽的状态*/
  draggingStatus: DraggingStatus,
  /** 离开容器方向*/
  leaveContainerDirection: DirectionAttributes | "";
  selectedWidgets: string[], //选择中的widget
  curFocusedWidgetId?: string; // 当前激活的部件
  lastSelectedWidget: string; // 最后选中的部件
}

const initialState: DragResizeState = {
  isDragging: false,
  isResizing: false,
  isDraggingDisabled: false,
  dragDetails: {
    draggingType: DraggingType.NONE,
    newWidget: {},
    draggedOn: '',
    lastDraggedOn: '',
    existingWidget: {
      mouseXInEleProportion: 0,
      mouseYInEleProportion: 0,
    }
  },
  draggingStatus: DraggingStatus.NONE,
  leaveContainerDirection: '',
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
      state.draggingStatus = DraggingStatus.PREPARE_MOVE
      state.dragDetails = {
        draggingType: DraggingType.NEW_WIDGET,
        newWidget: action.payload.newWidgetProps,
        draggedOn: MAIN_CONTAINER_WIDGET_ID,
        lastDraggedOn: MAIN_CONTAINER_WIDGET_ID,
        existingWidget:{} as any
      }
    },

    /**
    * @description 选中部件 (调整大小会选中)
    * @param 
    * @returns
    */
    selectWidget: (
      state,
      action: { payload: string },
    ) => {
      state.selectedWidgets = [action.payload]

    },
    /**
    * @description
    * @param 
    * @returns
    */
    setIsDragging: (state, action) => {
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
        draggingType: DraggingType.NONE,
        newWidget: {},
        draggedOn: '',
        lastDraggedOn: '',
        existingWidget:{} as any
      }
      state.draggingStatus = DraggingStatus.NONE
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
    /** 设置画布*/
    setDraggedOn: (state, action: {
      payload: string
    }) => {
      state.dragDetails.lastDraggedOn = state.dragDetails.draggedOn
      state.dragDetails.draggedOn = action.payload
    },

    /** 设置拖拽状态*/
    setDraggingStatus: (state, action: {
      payload: DraggingStatus
    }) => {
      state.draggingStatus = action.payload
    },

    /** 设置离开容器方向*/
    setLeaveContainerDirection: (state, action: {
      payload: DirectionAttributes | ""
    }) => {
      state.leaveContainerDirection = action.payload
    },


    /** 设置拖拽的现有元素 */
    draggingExistingWidget: (state, action: {
      payload: {
        canvasId: string,
        widgetId: string,
        existingWidget:any
      }
    }) => {
      const { canvasId, widgetId,existingWidget } = action.payload

      document.body.style.cursor = "grabbing"
      state.isDragging = true;
      state.draggingStatus = DraggingStatus.PREPARE_MOVE;
      state.selectedWidgets = [widgetId]

      state.dragDetails = {
        draggingType: DraggingType.EXISTING_WIDGET,
        newWidget: {},
        draggedOn: canvasId,
        lastDraggedOn: canvasId,
        existingWidget
      }
    }
  },
})


export const {
  focusWidget,
  setWidgetResizing,
  selectWidget,
  setNewWidgetDragging,
  endDragging,
  setIsDragging,
  setDraggedOn,
  setDraggingStatus,
  setLeaveContainerDirection,
  draggingExistingWidget
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
export const draggedOnSelector = (state: RootState) => {
  return state.ui.dragResize.dragDetails.draggedOn
}

/** 上一次所在的画布，也就是离开的是那个画布*/
export const lastDraggedOnSelector = (state: RootState) => {
  return state.ui.dragResize.dragDetails.lastDraggedOn
}

/** 拖动的状态*/
export const draggingStatusSelector = (state: RootState) => {
  return state.ui.dragResize.draggingStatus
}

/** 离开容器方向*/
export const leaveContainerDirectionSelector = (state: RootState) => {
  return state.ui.dragResize.leaveContainerDirection
}

export const draggingTypeSelector = (state: RootState) => {
  return state.ui.dragResize.dragDetails.draggingType
}

export const existingWidgetSelector = (state: RootState) => { 
  return state.ui.dragResize.dragDetails.existingWidget
}

export default dragResizeSlice.reducer