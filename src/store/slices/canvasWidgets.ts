//画布中widget的值
import { CANVAS_DEFAULT_MIN_ROWS, GridDefaults, MAIN_CONTAINER_WIDGET_ID } from "@/constant/canvas"
import { createSelector, createSlice } from "@reduxjs/toolkit"
import { RootState } from ".."
import { RenderModes } from "@/interface/canvas"



// const buttons = {}
// const children = []
// for (let i = 0; i < 30; i++) {
//   const button = {
//     widgetId: "button" + i,
//     leftColumn: (i * 10) % 50 + 5,
//     rightColumn: ((i * 10) % 50) + 15,
//     topRow: 4 * Math.floor(i / 5) + 12,
//     bottomRow: 4 * Math.floor(i / 5) + 16,
//     parentColumnSpace: (375 - 8) / 64,
//     parentRowSpace: 10,
//     parentId: "0",
//     type: "BUTTON_WIDGET",
//     widgetName: "Button Widget" + i,
//   }
//   buttons["button" + i] = button
//   children.push('button' + i)
// }

// const CanvasInfo = {
//   0: {
//     type: "CANVAS_WIDGET",
//     widgetId: "0",
//     topRow: 0,
//     bottomRow: Math.ceil(380),
//     renderMode: "CANVAS",
//     canExtend: true,
//     widgetName: "MainContainer",
//     detachFromLayout: true,
//     parentColumnSpace: 1,
//     parentRowSpace: 1,
//     leftColumn: 0,
//     rightColumn: 375,
//     version: 1,
//     isLoading: false,
//     children: children,
//     snapColumns: 64,
//     noPad: false,
//   },
//   ...buttons,
// }

const initialState: {
  [propName: string]: {
    topRow: number,
    bottomRow: number,
    leftColumn: number,
    rightColumn: number,
    parentColumnSpace: number,
    parentRowSpace: number,
    [propNams: string]: any
  }
} ={
  0: {
    type: "CANVAS_WIDGET",
    widgetId: MAIN_CONTAINER_WIDGET_ID,
    topRow: 0,
    bottomRow: CANVAS_DEFAULT_MIN_ROWS * GridDefaults.DEFAULT_GRID_ROW_HEIGHT, //380
    renderMode: RenderModes.CANVAS,
    canExtend: true,
    widgetName: "MainContainer",
    detachFromLayout: true,
    parentColumnSpace: 1,
    parentRowSpace: 1,
    leftColumn: 0,
    rightColumn: 375,
    version: 1,
    isLoading: false,
    children: ['one', 'two', 'three', 'four', 'five'],
    snapColumns: 64,
    noPad: true,
  },
  'one': {
    widgetId: 'one',
    leftColumn: 2,
    rightColumn: 14,
    topRow: 6,
    bottomRow: 12,
    parentId: '0',
    type: 'BUTTON_WIDGET',
    widgetName: 'Button Widget',
    renderMode: RenderModes.CANVAS,
    isDisabled: false,
    version: 1,
    isLoading: false,
    text: '按钮文字',
    parentColumnSpace: (375 - 8) / 64,
    parentRowSpace: 10,
    detachFromLayout: false,
    isVisible: false,
  },
  'two': {
    widgetId: 'two',
    leftColumn: 14,
    rightColumn: 25,
    topRow: 2,
    bottomRow: 10,
    parentId: '0',
    type: 'BUTTON_WIDGET',
    widgetName: 'Button Widget',
    renderMode: RenderModes.CANVAS,
    isDisabled: false,
    version: 1,
    isLoading: false,
    text: '按钮文字',
    parentColumnSpace: (375 - 8) / 64,
    parentRowSpace: 10,
    detachFromLayout: false,
    isVisible: false,
  },
  'three': {
    widgetId: 'three',
    leftColumn: 14,
    rightColumn: 30,
    topRow: 12,
    bottomRow: 24,
    parentId: '0',
    type: 'BUTTON_WIDGET',
    widgetName: 'Button Widget',
    renderMode: RenderModes.CANVAS,
    isDisabled: false,
    version: 1,
    isLoading: false,
    text: '按钮文字',
    parentColumnSpace: (375 - 8) / 64,
    parentRowSpace: 10,
    detachFromLayout: false,
    isVisible: false,
  },
  'four': {
    widgetId: 'four',
    leftColumn: 32,
    rightColumn: 39,
    topRow: 5,
    bottomRow: 20,
    parentId: '0',
    type: 'BUTTON_WIDGET',
    widgetName: 'Button Widget',
    renderMode: RenderModes.CANVAS,
    isDisabled: false,
    version: 1,
    isLoading: false,
    text: '按钮文字',
    parentColumnSpace: (375 - 8) / 64,
    parentRowSpace: 10,
    detachFromLayout: false,
    isVisible: false,
  },
  'five': {
    widgetId: 'five',
    leftColumn: 50,
    rightColumn: 64,
    topRow: 10,
    bottomRow: 38,
    parentId: '0',
    type: 'BUTTON_WIDGET',
    widgetName: 'Button Widget',
    renderMode: RenderModes.CANVAS,
    isDisabled: false,
    version: 1,
    isLoading: false,
    text: '按钮文字',
    parentColumnSpace: (375 - 8) / 64,
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
    },

    /** 更新widget信息*/
    updateWidgetAccordingWidgetId: (
      state,
      action: {
        payload: {
          widgetId: string,
          widgetRowCol: any,
        }
      }
    ) => {
      state[action.payload.widgetId] = {
        ...state[action.payload.widgetId],
        ...action.payload.widgetRowCol,
      }
    },

    /** 更新widgets信息*/
    updateWidgets: (
      state,
      action: {
        payload: {
          widgetsRowCol: any,
        }
      }
    ) => {
      Object.keys(action.payload.widgetsRowCol).forEach((key) => {
        let item = action.payload.widgetsRowCol[key]
        state[key] = {
          ...state[key],
          ...item,
        }
      })
    }
  }
})

export const {
  updateWidgetAccordingWidgetId,
  initLayout,
  updateWidgets
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

/**
 * @description 获取widget的子孩子id列表
 * @param widgetId
 */
export const getWidgetChildrenSelector = (widgetId: string) => {
  return createSelector(
    getWidgetsSelector,
    (canvasWidgets: any): string[] => {
      if (!!widgetId) {
        return canvasWidgets[widgetId].children
      }
      return []
    }
  )
}


/**
* @description 获取widget子孩子的详细信息列表
* @param 
* @returns
*/
export const getWidgetChildrenDetailSelector = (parentWidgetId: string) => {
  return createSelector(
    getWidgetsSelector,
    (canvasWidgets: any) => {
      let resultList: any[] = [];
      if (!!parentWidgetId) {
        let childrenIdList: string[] = canvasWidgets[parentWidgetId].children;
        for (let i = 0; i < childrenIdList.length; i++) {
          resultList.push(canvasWidgets[childrenIdList[i]])
        }
        return resultList
      }
      return resultList
    }
  )
}

export default canvasWidgetsSlice.reducer