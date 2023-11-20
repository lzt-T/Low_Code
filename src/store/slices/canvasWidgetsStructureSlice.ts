
/** 画布中的widget结构*/
import { createSlice } from '@reduxjs/toolkit'
import { pick } from "lodash"
import { RootState } from "@/store"
import { WIDGET_DSL_STRUCTURE_PROPS } from '@/constant/widget'
import { CANVAS_DEFAULT_MIN_ROWS, GridDefaults, MAIN_CONTAINER_WIDGET_ID } from '@/constant/canvas'

/**
 * @param rootWidgetId
 * @param widgets
 * @returns
 */
function denormalize(
  rootWidgetId: string,
  widgets: any,
): any {
  const rootWidget = widgets[rootWidgetId]

  const children = (rootWidget.children || []).map((childId: string) =>
    denormalize(childId, widgets),
  )
  const staticProps = Object.keys(WIDGET_DSL_STRUCTURE_PROPS)
  const structure = pick(rootWidget, staticProps)
  structure.children = children
  return structure
}

/**
* @description 找到父亲
* @param 
* @returns
*/
function findParent(dsl: any, parentId: string) {
  if (dsl.widgetId === parentId) {
    return dsl
  }
  if (dsl.children) {
    for (let i = 0; i < dsl.children.length; i++) {
      let result: any = findParent(dsl.children[i], parentId)
      if (result) {
        return result
      }
    }
  }
}

const initialState: { dsl: any } = {
  dsl: {
    type: "CANVAS_WIDGET",
    widgetId: MAIN_CONTAINER_WIDGET_ID,
    topRow: 0,
    //因为主画布的父亲单位长度为 1 
    bottomRow: CANVAS_DEFAULT_MIN_ROWS * GridDefaults.DEFAULT_GRID_ROW_HEIGHT,
    children: [
      {
        parentId: MAIN_CONTAINER_WIDGET_ID,
        type: "BUTTON_WIDGET",
        widgetId: "one"
      },
      {
        parentId: MAIN_CONTAINER_WIDGET_ID,
        type: "BUTTON_WIDGET",
        widgetId: "two"
      },
      {
        parentId: MAIN_CONTAINER_WIDGET_ID,
        type: "BUTTON_WIDGET",
        widgetId: "three"
      },
      {
        parentId: MAIN_CONTAINER_WIDGET_ID,
        type: "BUTTON_WIDGET",
        widgetId: "four"
      },
      {
        parentId: MAIN_CONTAINER_WIDGET_ID,
        type: "BUTTON_WIDGET",
        widgetId: "five"
      },
      //二级画布
      {
        parentId: MAIN_CONTAINER_WIDGET_ID,
        type: "CONTAINER_WIDGET",
        widgetId: 'CONTAINER_ONE',
        children: [
          {
            parentId: 'CONTAINER_ONE',
            type: "BUTTON_WIDGET",
            widgetId: "CONTAINER_BUTTON_ONE"
          },
          {
            parentId: 'CONTAINER_ONE',
            type: "BUTTON_WIDGET",
            widgetId: "CONTAINER_BUTTON_TWO"
          },
        ]
      },
      {
        parentId: MAIN_CONTAINER_WIDGET_ID,
        type: "BUTTON_WIDGET",
        widgetId: "six"
      },
    ],
  }
}

const canvasWidgetsStructure = createSlice({
  name: 'canvasWidgetStructure',
  initialState,
  reducers: {
    initLayout: (
      state,
      action: any,
    ) => {
      state.dsl = { ...denormalize(MAIN_CONTAINER_WIDGET_ID, action.payload.widgets) }
    },

    /** 添加widget到dsl里面*/
    addWidgetStructure: (state, action: { payload: any }) => {
      let { parentId } = action.payload;
      let parent = findParent(state.dsl, parentId)
      if (!parent.children) {
        parent.children = []
      }
      parent.children.push(action.payload)
    },

    /** 拖拽现有的widget到其他dsl里面*/
    dragWidgetToOtherContainer: (state, action: {
      payload: {
        widgetInfo: any,
        oldParentId: string,
        newParentId: string,
      }
    }) => {
      let { widgetInfo, oldParentId, newParentId } = action.payload


      let oldParent = findParent(state.dsl, oldParentId)
      let newParent = findParent(state.dsl, newParentId)
      //从旧的父级里面删除
      oldParent.children = oldParent.children.filter((item: any) => {
        return item.widgetId != widgetInfo.widgetId
      })
      //添加到新的父级里面
      if (!newParent.children) {
        newParent.children = []
      }
      newParent.children.push({
        parentId: newParentId,
        type: widgetInfo.type,
        widgetId: widgetInfo.widgetId
      })

      // console.log('asdsadasds');

      // let { widgetId, oldParentId,newParentId } = action.payload

    },
  },
})

export const {
  addWidgetStructure,
  dragWidgetToOtherContainer
} = canvasWidgetsStructure.actions

/** 获取画布中的widget结构*/
export const getCanvasWidgetDsl = (state: RootState) => state.canvasWidgetsStructure.dsl

export default canvasWidgetsStructure.reducer
