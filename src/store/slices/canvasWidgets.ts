//画布中widget的值
import { MAIN_CONTAINER_WIDGET_ID } from "@/constant/canvas"
import { createSelector, createSlice } from "@reduxjs/toolkit"
import { RootState } from ".."
import { RenderModes } from "@/interface/canvas"
import { addWidgetStructure, dragWidgetToOtherContainer } from "./canvasWidgetsStructureSlice"
import { clearAddContainerRows, endDragging, setWidgetResizing } from "./dragResize"
import _ from "lodash"
import { stopReflow } from "./widgetReflowSlice"
import { DraggingType } from "@/enum/move"

const initialState: {
  [propName: string]: {
    widgetId: string,
    parentId?: string,
    type: string,
    topRow: number,
    bottomRow: number,
    leftColumn: number,
    rightColumn: number,
    parentColumnSpace: number,
    parentRowSpace: number,
    // children?: string[],
    [propName: string]: any
  }
} = {
  0: {
    type: "CANVAS_WIDGET",
    widgetId: MAIN_CONTAINER_WIDGET_ID,
    topRow: 0,
    // bottomRow: CANVAS_DEFAULT_MIN_ROWS * GridDefaults.DEFAULT_GRID_ROW_HEIGHT, //380
    bottomRow: 1400, //1400
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
    children: ['one', 'two', 'three', 'four', 'five', 'CONTAINER_ONE'],
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
    text: '1',
    parentColumnSpace: (375 - 8) / 64,
    parentRowSpace: 10,
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
    text: '2',
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
    text: '3',
    parentColumnSpace: (375 - 8) / 64,
    parentRowSpace: 10,
    detachFromLayout: false,
    isVisible: false,
  },
  'four': {
    widgetId: 'four',
    leftColumn: 32,
    rightColumn: 39,
    topRow: 1,
    bottomRow: 22,
    parentId: '0',
    type: 'BUTTON_WIDGET',
    widgetName: 'Button Widget',
    renderMode: RenderModes.CANVAS,
    isDisabled: false,
    version: 1,
    isLoading: false,
    text: '4',
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
    text: '5',
    parentColumnSpace: (375 - 8) / 64,
    parentRowSpace: 10,
    detachFromLayout: false,
    isVisible: false,
  },
  'CONTAINER_ONE': {
    widgetId: 'CONTAINER_ONE',
    leftColumn: 2,
    rightColumn: 45,
    topRow: 50,
    bottomRow: 90,
    parentId: '0',
    widgetName: 'CONTAINER Widget',
    type: 'CONTAINER_WIDGET',
    parentRowSpace: 10,
    parentColumnSpace: (375 - 8) / 64,
    containRows: 40,
    children: ['CONTAINER_BUTTON_ONE', 'CONTAINER_BUTTON_TWO'],
  },
  'CONTAINER_BUTTON_ONE': {
    widgetId: 'CONTAINER_BUTTON_ONE',
    leftColumn: 0,
    rightColumn: 20,
    topRow: 6,
    bottomRow: 12,
    parentId: 'CONTAINER_ONE',
    type: 'BUTTON_WIDGET',
    widgetName: 'Button Widget',
    text: 'CONTAINER_BUTTON_ONE',
    parentColumnSpace: (45 - 2 - 1) * ((375 - 8) / 64) / 64,
    parentRowSpace: 10,
  },
  'CONTAINER_BUTTON_TWO': {
    widgetId: 'CONTAINER_BUTTON_TWO',
    leftColumn: 2,
    rightColumn: 50,
    topRow: 15,
    bottomRow: 22,
    parentId: 'CONTAINER_ONE',
    type: 'BUTTON_WIDGET',
    widgetName: 'Button Widget',
    text: 'CONTAINER_BUTTON_TWO',
    parentColumnSpace: (45 - 2 - 1) * ((375 - 8) / 64) / 64,
    parentRowSpace: 10,
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

    /** 更新单个widget信息*/
    updateWidgetAccordingWidgetId: (
      state,
      action: {
        payload: {
          widgetId: string,
          newWidgetInfo: any,
        }
      }
    ) => {
      const { widgetId, newWidgetInfo } = action.payload
      let widgetInfo = state[widgetId]
      state[widgetId] = {
        ...state[widgetId],
        ...newWidgetInfo,
      }
      let resultContainRows = 0;
      if (widgetInfo.type === 'CONTAINER_WIDGET'
        && newWidgetInfo.bottomRow - newWidgetInfo.topRow > widgetInfo.containRows
      ) {
        resultContainRows = newWidgetInfo.bottomRow - newWidgetInfo.topRow
        state[widgetId] = {
          ...state[widgetId],
          containRows: resultContainRows,
        }
      }
    },

    /** 更新多个widget信息*/
    updateWidgets: (
      state,
      action: {
        payload: {
          newWidgetInfos: any,
        }
      }
    ) => {
      Object.keys(action.payload.newWidgetInfos).forEach((key) => {
        let item = action.payload.newWidgetInfos[key]
        state[key] = {
          ...state[key],
          ...item,
        }
      })
    },

    /** 增加widget*/
    addWidget: (state, action) => {
      state[action.payload.parentId].children?.push(action.payload.widgetId)
      state[action.payload.widgetId] = action.payload
    },

    /** 改变children列表*/
    changeChildren: (state, action: {
      payload: {
        widgetId: string,
        oldParentId: string,
        newParentId: string,
      }
    }) => {
      let { widgetId, oldParentId, newParentId } = action.payload
      let oldParent = state[oldParentId]
      let newParent = state[newParentId]
      oldParent.children = oldParent.children.filter((item: any) => {
        return item != widgetId
      })

      if (!newParent.children) {
        newParent.children = []
      }
      newParent.children.push(widgetId)
    },

    /** 为canvas添加延长的row*/
    addContainerBottomRow: (state, action: {
      payload: {
        canvasId: string,
        addRow: number,
      }
    }) => {
      const { canvasId, addRow } = action.payload
      if (canvasId === MAIN_CONTAINER_WIDGET_ID) {
        state[canvasId].bottomRow += addRow
      }
      state[canvasId].containRows += addRow
    },
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


/** 为画布添加widget*/
export const addNewWidgetChunk = (
  data: {
    position: any,
    rowSpace: number,
    columnSpace: number,
  }
) => {
  return (dispatch: any, getState: any) => {
    const { position, rowSpace, columnSpace } = data
    const state = getState()
    let newWidgetInfo = state.ui.dragResize.dragDetails.newWidget;
    let parentId = state.ui.dragResize.dragDetails.draggedOn;
    let otherInfo = state.widgetConfigs.configs[newWidgetInfo.type]

    let newWidgetProps = {
      widgetId: newWidgetInfo.widgetId,
      parentId,
      type: newWidgetInfo.type,
      topRow: position.topRow,
      bottomRow: position.bottomRow,
      leftColumn: position.leftColumn,
      rightColumn: position.rightColumn,
      parentRowSpace: rowSpace,
      parentColumnSpace: columnSpace,
      ...otherInfo,
    }

    if (newWidgetInfo.type === 'CONTAINER_WIDGET') {
      newWidgetProps = _.merge({}, newWidgetProps, {
        containRows: otherInfo.rows
      })
    }

    dispatch(canvasWidgetsSlice.actions.addWidget(newWidgetProps))

    dispatch(addWidgetStructure(
      {
        parentId,
        type: newWidgetInfo.type,
        widgetId: newWidgetInfo.widgetId,
      }
    ))

  }
}

/** 拖拽现有的widget*/
export const dragExistWidgetChunk = (
  infoObj: {
    position: any,
    newParentId: string,
    widgetId: string,
    rowSpace: number,
    columnSpace: number,
  }
) => {
  return (dispatch: any, getState: any) => {
    let { position, newParentId, widgetId, rowSpace, columnSpace } = infoObj
    const state = getState()
    let widgetInfo = state.canvasWidgets[widgetId]
    let oldParentId = widgetInfo.parentId
    widgetInfo = {
      ...widgetInfo,
      parentId: newParentId,
      topRow: position.topRow,
      bottomRow: position.bottomRow,
      leftColumn: position.leftColumn,
      rightColumn: position.rightColumn,
      parentRowSpace: rowSpace,
      parentColumnSpace: columnSpace,
    }

    dispatch(canvasWidgetsSlice.actions.updateWidgetAccordingWidgetId(
      {
        widgetId,
        newWidgetInfo: widgetInfo,
      }
    ))

    if (oldParentId != newParentId) {
      dispatch(dragWidgetToOtherContainer({ widgetInfo, oldParentId, newParentId }))
      dispatch(canvasWidgetsSlice.actions.changeChildren({ widgetId, oldParentId, newParentId }))
    }
  }
}

/** 拖拽结束Chunk*/
export const dragEndChunk = (type: DraggingType, data: {
  /** 是否可以放置*/
  isCanPlaced: boolean,
  position: any,
  parentUnit: {
    rowSpace: number,
    columnSpace: number,
  },
  /** 受到影响的widget信息*/
  affectWidgetInfo: any,
  newParentId?: string,
  widgetId?: string,
}) => {
  return (dispatch: any, getState: any) => {
    const { position, parentUnit, newParentId, widgetId,
      affectWidgetInfo, isCanPlaced
    } = data

    const state = getState()

    if (isCanPlaced && [DraggingType.NEW_WIDGET, DraggingType.EXISTING_WIDGET].includes(type)) {
      dispatch(updateWidgets({ newWidgetInfos: affectWidgetInfo }))
      if (type === DraggingType.NEW_WIDGET) {
        dispatch(addNewWidgetChunk({
          position,
          rowSpace: parentUnit.rowSpace,
          columnSpace: parentUnit.columnSpace,
        }))
      }
      if (type === DraggingType.EXISTING_WIDGET) {
        dispatch(dragExistWidgetChunk({
          position,
          newParentId: newParentId!,
          widgetId: widgetId!,
          rowSpace: parentUnit.rowSpace,
          columnSpace: parentUnit.columnSpace,
        }))
      }

      //是否需要为画布添加延长的row
      let addRowInfo = state.ui.dragResize.addRowInfo
      if (addRowInfo.rowNum != 0) {
        dispatch(canvasWidgetsSlice.actions.addContainerBottomRow({
          canvasId: addRowInfo.widgetId,
          addRow: addRowInfo.rowNum,
        }))
        dispatch(clearAddContainerRows())
      }
    }


    dispatch(stopReflow())
    dispatch(endDragging())
  }
}

/** 调整大小结束*/
export const resizeWidgetEndChunk = (
  data: {
    widgetId: string,
    /** 调整widget信息*/
    resizeWidgetInfo: any,
    /** 受到影响的widget信息*/
    affectWidgetInfo: any,
  }
) => {
  return (dispatch: any, getState: any) => {
    const state = getState()
    const { widgetId, resizeWidgetInfo, affectWidgetInfo } = data
    dispatch(stopReflow())
    dispatch(setWidgetResizing({ isResizing: false }))

    dispatch(updateWidgetAccordingWidgetId(
      {
        widgetId,
        newWidgetInfo: resizeWidgetInfo,
      }
    ))
    dispatch(updateWidgets({ newWidgetInfos: affectWidgetInfo }))

    //是否需要为画布添加延长的row
    let addRowInfo = state.ui.dragResize.addRowInfo
    if (addRowInfo.rowNum != 0) {
      dispatch(canvasWidgetsSlice.actions.addContainerBottomRow({
        canvasId: addRowInfo.widgetId,
        addRow: addRowInfo.rowNum,
      }))
      dispatch(clearAddContainerRows())
    }
  }
}

export default canvasWidgetsSlice.reducer