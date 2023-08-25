import { GridDefaults } from "./canvas"

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