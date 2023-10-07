
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

    /** 初步这个这样，后面再改变*/
    addWidgetStructure: (state,action) => {
      state.dsl.children.push(action.payload)
    },
  },
})


export const {
  addWidgetStructure
} = canvasWidgetsStructure.actions

/** 获取画布中的widget结构*/
export const getCanvasWidgetDsl = (state: RootState) => state.canvasWidgetsStructure.dsl

export default canvasWidgetsStructure.reducer
