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

/** 判断是否加速进入容器阈值*/
export const CONTAINER_WIDGET_DRAG_ENTER_THRESHOLD = 3.1

/** 滚动的速度*/
export const SCROLL_SPEED = 15

/** 滚动间隔 毫秒*/
export const SCROLL_INTERVAL = 100

/** 滚动边界  什么使用开始滚动 */
export const SCROLL_BOUNDARY = 30

/** 增加row边界值*/
export const ADD_ROW_BOUNDARY = 50

/** 画布增加Rows数*/
export const CANVAS_ADD_ROWS_NUM = 3