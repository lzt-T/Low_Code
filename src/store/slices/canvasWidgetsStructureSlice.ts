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
    children: [],
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
  },
})

/** 获取画布中的widget结构*/
export const getCanvasWidgetDsl = (state: RootState) => state.canvasWidgetsStructure.dsl

export default canvasWidgetsStructure.reducer