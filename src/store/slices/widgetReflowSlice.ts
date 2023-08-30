import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '..'



export interface WidgetReflowState {
  isReflowing: boolean,
  reflowingWidgets: {
    [propName: string]: {
      //组件宽度
      width?: number;
      //组件高度
      height?: number
    }
  }
}

const initialState: WidgetReflowState = {
  isReflowing: false,
  reflowingWidgets: {}
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
    }
  }
})

export const { stopReflow, reflowMove } = widgetReflowSlice.actions

export const isWidgetReflowingSelector = (state: RootState) => state.widgetReflow.isReflowing

export default widgetReflowSlice.reducer

export const getReflowSelector = (state: RootState): WidgetReflowState => {
  return state.widgetReflow
}

export const getReflowByIdSelector = (widgetId: string) => {
  return createSelector(getReflowSelector, (reflowState: WidgetReflowState) => {
    if (reflowState.reflowingWidgets) {
      return reflowState.reflowingWidgets[widgetId]
    }
    return undefined
  })
}
