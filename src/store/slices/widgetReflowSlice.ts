import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '..'



export interface WidgetReflowState {
  isReflowing: boolean,
  reflowingWidgets: {
    [propName: string]: {
      //组件宽度
      width?: number;
      //组件高度
      height?: number;

      /** x跟原来差值*/
      X?: number;
      /** y跟原来差值*/
      Y?: number;
      // width?: number;
      // height?: number;
      // horizontalDepth?: number;
      // verticalDepth?: number;
      // x?: number;
      // y?: number;
      // maxX?: number;
      // maxY?: number;
      // directionX?: ReflowDirection;
      // directionY?: ReflowDirection;
      // dimensionXBeforeCollision?: number;
      // dimensionYBeforeCollision?: number;
      // horizontalMaxOccupiedSpace?: number;
      // horizontalEmptySpaces?: number;
      // verticalMaxOccupiedSpace?: number;
      // verticalEmptySpaces?: number;
    }
  },
  widgetsSpaceGraph: {
    [propName: string]: any
  },
  widgetsSpaceGraphAccording:any[]
}

const initialState: WidgetReflowState = {
  isReflowing: false,
  reflowingWidgets: {},
  widgetsSpaceGraph:{},
  widgetsSpaceGraphAccording :[],
}

const widgetReflowSlice = createSlice({
  name: 'widgetReflow',
  initialState,
  reducers: {
    /** 停止reflow*/
    stopReflow(state) {
      state.isReflowing = false
      state.reflowingWidgets = {}
    },
    /** 开始reflow*/
    reflowMove(state, action: any) {
      state.isReflowing = true
      state.reflowingWidgets = { ...action.payload }
    },
    setReflowingWidgets(state, action) {
      state.reflowingWidgets = { ...action.payload }
    },
    setWidgetsSpaceGraph(state, action) { 
      state.widgetsSpaceGraph = { ...action.payload };
    },
    setWidgetsSpaceGraphAccording(state, action) { 
      state.widgetsSpaceGraphAccording = action.payload;
    }
  }
})

export const {
  stopReflow,
  reflowMove,
  setReflowingWidgets,
  setWidgetsSpaceGraph,
  setWidgetsSpaceGraphAccording
} = widgetReflowSlice.actions

export const isWidgetReflowingSelector = (state: RootState) => state.widgetReflow.isReflowing
export const widgetsSpaceGraphSelector = (state: RootState) => state.widgetReflow.widgetsSpaceGraph

export default widgetReflowSlice.reducer

export const getReflowSelector = (state: RootState): WidgetReflowState => {
  return state.widgetReflow
}
export const getWidgetsSpaceGraphAccordingSelector = (state: RootState): any => {
  return state.widgetReflow.widgetsSpaceGraphAccording
}

export const getReflowByIdSelector = (widgetId: string) => {
  return createSelector(getReflowSelector, (reflowState: WidgetReflowState) => {
    if (reflowState.reflowingWidgets) {
      return reflowState.reflowingWidgets[widgetId]
    }
    return undefined
  })
}
