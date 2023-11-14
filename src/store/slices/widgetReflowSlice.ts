import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '..'
import _ from 'lodash'



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
  //组件位置关系图，分区域
  widgetsSpaceGraph: {
    [propName: string]: any
  },
}

const initialState: WidgetReflowState = {
  isReflowing: false,
  reflowingWidgets: {},
  widgetsSpaceGraph: {},
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

    /** 拖拽时设置reflow*/
    setReflowingWidgetsOne(state, action: {
      payload: {
        idList: string[],
        reflowData: any,
      }
    }) {
      let resultReflowData:any = {};
      for (let key in state.reflowingWidgets) {
        if (!action.payload.idList.includes(key)) {
          resultReflowData[key] = state.reflowingWidgets[key]
        }
      }
      state.reflowingWidgets = { ...resultReflowData, ...action.payload.reflowData }

    },

    /** 设置位置依赖关系*/
    setWidgetsSpaceGraph(state, action) {
      state.widgetsSpaceGraph = { ...action.payload };
    },

    /**
    * @description 清空其他画布的reflow数据
    * @param payload 儿子部件id列表
    * @returns
    */
    clearOtherCanvasReflowData(state, action: {
      payload: [string]
    }) {
      let resultReflowData: any = {};
      resultReflowData=_.pick(state.reflowingWidgets,action.payload)
      state.reflowingWidgets = { ...resultReflowData }
    },
  }
})

export const {
  stopReflow,
  reflowMove,
  setReflowingWidgets,
  setWidgetsSpaceGraph,
  setReflowingWidgetsOne,
  clearOtherCanvasReflowData
} = widgetReflowSlice.actions

export const isWidgetReflowingSelector = (state: RootState) => state.widgetReflow.isReflowing
export const widgetsSpaceGraphSelector = (state: RootState) => state.widgetReflow.widgetsSpaceGraph

export default widgetReflowSlice.reducer

export const getReflowSelector = (state: RootState): any => {
  return state.widgetReflow.reflowingWidgets
}

export const getReflowByIdSelector = (widgetId: string) => {
  return createSelector(getReflowSelector, (reflowingWidgets: any) => {
    if (reflowingWidgets) {
      return reflowingWidgets[widgetId]
    }
    return undefined
  })
}

/**
* @description 根据画布id清空其他画布的reflow数据
* @param canvasId 当前画布id
* @returns
*/
export const clearReflowingWidgetsByIdChunk = (canvasId: string) => { 
  return (dispatch: any, getState: any) => { 
    let childrenKeyList = getState().canvasWidgets[canvasId].children;
    dispatch(clearOtherCanvasReflowData(childrenKeyList))
  }
}