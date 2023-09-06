import { GridDefaults } from "./canvas"

/** 最小高度占格*/
export const MIN_HEIGHT_ROW = 2
export const MIN_WIDTH_COLUMN = 2

/** widget的padding  4*/
export const WIDGET_PADDING = GridDefaults.DEFAULT_GRID_ROW_HEIGHT * 0.4

/** 画布中widget列表dsl结构*/
export const WIDGET_DSL_STRUCTURE_PROPS = {
  children: true,
  type: true,
  widgetId: true,
  parentId: true,
  topRow: true,
  bottomRow: true,
}