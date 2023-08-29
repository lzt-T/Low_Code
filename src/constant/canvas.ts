/** 主画布Id*/
export const MAIN_CONTAINER_WIDGET_ID = "0"
/** 画布最小的行数*/
export const CANVAS_DEFAULT_MIN_ROWS = 38

/** 画布最小高度*/
export const CANVAS_DEFAULT_MIN_HEIGHT_PX = 380

export const GridDefaults = {
  DEFAULT_CELL_SIZE: 1,
  DEFAULT_WIDGET_WIDTH: 200,
  DEFAULT_WIDGET_HEIGHT: 100,
  DEFAULT_GRID_COLUMNS: 64,
  //默认一个单位row高度
  DEFAULT_GRID_ROW_HEIGHT: 10,
  CANVAS_EXTENSION_OFFSET: 2,
  VIEW_MODE_MAIN_CANVAS_EXTENSION_OFFSET: 5,
  //主画布延长的row
  MAIN_CANVAS_EXTENSION_OFFSET: 8,
}

/** 画布默认padding 6*/
export const CONTAINER_GRID_PADDING = GridDefaults.DEFAULT_GRID_ROW_HEIGHT * 0.6

export type RenderMode =
  | "COMPONENT_PANE"
  | "CANVAS"
  | "PAGE"
  | "CANVAS_SELECTED";

export const RenderModes: { [id: string]: RenderMode } = {
  COMPONENT_PANE: "COMPONENT_PANE",
  CANVAS: "CANVAS",
  PAGE: "PAGE",
  CANVAS_SELECTED: "CANVAS_SELECTED",
}